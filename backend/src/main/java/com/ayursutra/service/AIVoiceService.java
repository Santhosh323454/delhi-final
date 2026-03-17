package com.ayursutra.service;

import com.ayursutra.model.Patient;
import com.ayursutra.model.Patient.CallStatus;
import com.ayursutra.repository.PatientRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
public class AIVoiceService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    @Value("${backend.url:}")
    private String backendUrl;

    @Autowired
    private PatientRepository patientRepository;

    @PostConstruct
    public void initTwilio() {
        if (isTwilioConfigured()) {
            Twilio.init(accountSid, authToken);
            System.out.println("[AIVoiceService] Twilio initialised successfully.");
        } else {
            System.err.println("[AIVoiceService] Twilio credentials not set.");
        }
    }

    // ─── SCHEDULED JOBS ───
    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Kolkata")
    public void resetDailyCallStatus() {
        List<Patient> activePatients = getActivePatients();
        activePatients.forEach(p -> p.setCallStatus(CallStatus.PENDING));
        patientRepository.saveAll(activePatients);
        System.out.println("[AIVoiceService] Call statuses reset to PENDING for today.");
    }

    // Daily AI Interview for ALL active patients at 7:00 PM
    @Scheduled(cron = "0 0 19 * * *", zone = "Asia/Kolkata")
    public void processDailyAiCalls() {
        System.out.println("[AIVoiceService] Starting daily AI interviews (19:00).");
        List<Patient> patients = getActivePatients();
        for (Patient patient : patients) {
            String therapyName = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic";
            makeVoiceCall(patient.getUser().getPhone(), patient.getUser().getName(), therapyName);
        }
    }

    // 1st Treatment Reminder (1 day before) at 4:00 PM
    @Scheduled(cron = "0 0 16 * * *", zone = "Asia/Kolkata")
    public void firstReminderCall() {
        System.out.println("[AIVoiceService] Starting first treatment reminders (16:00).");
        processScheduledCalls();
    }

    // 2nd Treatment Reminder at 6:30 PM (retry for unanswered)
    @Scheduled(cron = "0 30 18 * * *", zone = "Asia/Kolkata")
    public void retryReminderCall() {
        System.out.println("[AIVoiceService] Retrying treatment reminders (18:30).");
        processScheduledCalls();
    }

    // 3rd Treatment Reminder at 8:00 PM (final retry)
    @Scheduled(cron = "0 0 20 * * *", zone = "Asia/Kolkata")
    public void finalReminderCall() {
        System.out.println("[AIVoiceService] Final retry for treatment reminders (20:00).");
        processScheduledCalls();
    }
    
    // SMS Fallback at 8:50 PM if they never answered the reminders today
    @Scheduled(cron = "0 50 20 * * *", zone = "Asia/Kolkata")
    public void sendFallbackSms() {
        System.out.println("[AIVoiceService] Sending fallback SMS for unreached patients (20:50).");
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Patient> patients = patientRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())
                        && p.getCallStatus() == CallStatus.PENDING
                        && p.getNextCheckupDate() != null
                        && p.getNextCheckupDate().equals(tomorrow))
                .toList();
        
        for (Patient patient : patients) {
            String therapyName = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic";
            String smsBody = String.format("Vanakkam %s. This is an important reminder from AyurSutra. You have a %s treatment session scheduled for tomorrow. Please be ready.", 
                    patient.getUser().getName(), therapyName);
            sendSms(patient.getUser().getPhone(), smsBody);
            System.out.println("[AIVoiceService] Fallback SMS sent to: " + patient.getUser().getName());
        }
    }

    private void processScheduledCalls() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Patient> patients = patientRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())
                        && p.getCallStatus() == CallStatus.PENDING
                        && p.getNextCheckupDate() != null
                        && p.getNextCheckupDate().equals(tomorrow))
                .toList();

        for (Patient patient : patients) {
            makeReminderCall(patient.getUser().getPhone(), patient.getUser().getName(),
                    patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic");
        }
    }

    // ─── CORE VOICE METHODS ───

    /**
     * PURPLE ROBOT BUTTON: AI Interview with Speech Capture
     */
    public boolean makeVoiceCall(String phoneNumber, String patientName, String therapyName) {
        if (!isTwilioConfigured())
            return false;
        String formattedPhone = formatPhone(phoneNumber);

        String callbackBase = getBaseUrl();
        String gatherAction = callbackBase + "/api/twilio/gather-response";

        String twiml = "<Response>"
                + "<Say language=\"en-IN\">Vanakkam " + patientName + ". This is AyurSutra health assistant. "
                + "How are you feeling today? Do you have any body pain or health problems? "
                + "Please speak after the beep.</Say>"
                + "<Gather input=\"speech\" action=\"" + gatherAction
                + "\" method=\"POST\" speechTimeout=\"auto\" language=\"en-IN\">"
                + "</Gather>"
                + "<Say language=\"en-IN\">We did not hear a response. We will try again later. Goodbye.</Say>"
                + "</Response>";

        return executeCall(formattedPhone, twiml, true);
    }

    /**
     * YELLOW PHONE BUTTON: Just a Reminder (No Gather)
     */
    public boolean makeReminderCall(String phoneNumber, String patientName, String therapyName) {
        if (!isTwilioConfigured())
            return false;
        String formattedPhone = formatPhone(phoneNumber);

        String twiml = "<Response>"
                + "<Say language=\"en-IN\">Vanakkam " + patientName + ". "
                + "This is a reminder from AyurSutra. "
                + "You have a " + therapyName + " treatment session scheduled for tomorrow. "
                + "Please be ready. Thank you. Goodbye.</Say>"
                + "</Response>";

        return executeCall(formattedPhone, twiml, false);
    }

    // ─── HELPERS ───

    private boolean executeCall(String to, String twiml, boolean withCallback) {
        try {
            String twimlUrl = "http://twimlets.com/echo?Twiml=" + URLEncoder.encode(twiml, StandardCharsets.UTF_8);
            var creator = Call.creator(new PhoneNumber(to), new PhoneNumber(twilioPhoneNumber), URI.create(twimlUrl));

            if (withCallback) {
                String callbackUrl = getBaseUrl() + "/api/twilio/call-status";
                creator.setStatusCallback(URI.create(callbackUrl))
                        .setStatusCallbackMethod(com.twilio.http.HttpMethod.POST);
            }

            creator.create();
            return true;
        } catch (Exception e) {
            System.err.println("[AIVoiceService] Twilio error: " + e.getMessage());
            return false;
        }
    }

    private String getBaseUrl() {
        return (backendUrl != null && !backendUrl.isBlank()) ? backendUrl : "https://maxim-unbrushed-arie.ngrok-free.dev";
    }

    private String formatPhone(String phone) {
        if (phone == null)
            return "";
        return phone.startsWith("+") ? phone : "+91" + phone;
    }

    private void sendSms(String toNumber, String body) {
        try {
            Message.creator(new PhoneNumber(formatPhone(toNumber)), new PhoneNumber(twilioPhoneNumber), body).create();
        } catch (Exception e) {
            System.err.println("SMS failed: " + e.getMessage());
        }
    }

    private boolean isTwilioConfigured() {
        return accountSid != null && !accountSid.isEmpty() && !"YOUR_ACCOUNT_SID_HERE".equals(accountSid);
    }

    private List<Patient> getActivePatients() {
        return patientRepository.findAll().stream().filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())).toList();
    }
}