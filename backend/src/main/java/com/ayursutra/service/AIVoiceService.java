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

/**
 * AIVoiceService — Smart 3-attempt voice reminder + SMS fallback
 *
 * Daily reminder cycle (all times IST / server-local):
 * 05:45 PM → Reset every ACTIVE patient's callStatus to PENDING
 * 06:00 PM → 1st voice call to ALL ACTIVE patients
 * 06:30 PM → 2nd voice call ONLY to patients still PENDING (i.e., call not
 * answered)
 * 08:00 PM → 3rd (final) voice call to still-PENDING patients
 * 08:30 PM → SMS to patients still PENDING after 3rd call (marks them MISSED)
 */
@Service
public class AIVoiceService {

    // ── Twilio credentials ────────────────────────────────────────────────────
    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;
    // ──────────────────────────────────────────────────────────────────────────

    @Autowired
    private PatientRepository patientRepository;

    @PostConstruct
    public void initTwilio() {
        if (isTwilioConfigured()) {
            Twilio.init(accountSid, authToken);
            System.out.println("[AIVoiceService] Twilio initialised successfully.");
        } else {
            System.err.println("[AIVoiceService] Twilio credentials not set — scheduled calls will be skipped.");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SCHEDULED JOBS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * 5:45 PM — Reset all ACTIVE patient call-statuses to PENDING
     * so today's cycle always starts fresh.
     */
    @Scheduled(cron = "0 45 17 * * *")
    public void resetDailyCallStatus() {
        List<Patient> activePatients = getActivePatients();
        activePatients.forEach(p -> p.setCallStatus(CallStatus.PENDING));
        patientRepository.saveAll(activePatients);
        System.out.println("[AIVoiceService] 5:45 PM — Reset call status to PENDING for "
                + activePatients.size() + " active patient(s).");
    }

    /**
     * 6:00 PM — Smart reminder: calls ACTIVE patients whose nextCheckupDate is
     * TOMORROW.
     * On a successful call, advances nextCheckupDate by intervalDays (capped at
     * endDate).
     */
    @Scheduled(cron = "0 0 18 * * *")
    public void firstReminderCall() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        System.out.println("[AIVoiceService] 6:00 PM — Checking for patients with checkup on " + tomorrow);

        List<Patient> patients = patientRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())
                        && p.getNextCheckupDate() != null
                        && p.getNextCheckupDate().equals(tomorrow))
                .toList();

        System.out.println("[AIVoiceService] 6:00 PM — " + patients.size() + " patient(s) due for tomorrow's checkup.");

        for (Patient patient : patients) {
            String phone = patient.getUser().getPhone();
            String name = patient.getUser().getName();
            String therapy = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic";

            boolean success = makeVoiceCall(phone, name, therapy);
            if (success) {
                patient.setCallStatus(CallStatus.ANSWERED);
                // Advance nextCheckupDate by intervalDays, but never past endDate
                if (patient.getIntervalDays() != null && patient.getEndDate() != null) {
                    LocalDate next = patient.getNextCheckupDate().plusDays(patient.getIntervalDays());
                    if (!next.isAfter(patient.getEndDate())) {
                        patient.setNextCheckupDate(next);
                        System.out.println("[AIVoiceService] Advancing next checkup for "
                                + name + " → " + next);
                    } else {
                        System.out.println("[AIVoiceService] Plan complete for " + name
                                + " — no further checkups scheduled.");
                    }
                }
                patientRepository.save(patient);
            }
        }
        System.out.println("[AIVoiceService] 6:00 PM — First-call round complete.");
    }

    /**
     * 6:30 PM — Retry call for patients whose status is still PENDING
     * (i.e., the 6 PM call was not answered / failed).
     */
    @Scheduled(cron = "0 30 18 * * *")
    public void retryReminderCall() {
        System.out.println("[AIVoiceService] 6:30 PM — Retry calls for PENDING patients...");
        List<Patient> pendingPatients = patientRepository.findAll()
                .stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())
                        && p.getCallStatus() == CallStatus.PENDING)
                .toList();

        for (Patient patient : pendingPatients) {
            String phone = patient.getUser().getPhone();
            String name = patient.getUser().getName();
            String therapy = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic";

            boolean success = makeVoiceCall(phone, name, therapy);
            if (success) {
                patient.setCallStatus(CallStatus.ANSWERED);
                patientRepository.save(patient);
            }
        }
        System.out.println("[AIVoiceService] 6:30 PM — Retry-call round complete. "
                + pendingPatients.size() + " patient(s) attempted.");
    }

    /**
     * 8:00 PM — Final voice call for patients still PENDING after both earlier
     * attempts.
     */
    @Scheduled(cron = "0 0 20 * * *")
    public void finalReminderCall() {
        System.out.println("[AIVoiceService] 8:00 PM — Final reminder calls for PENDING patients...");
        List<Patient> pendingPatients = patientRepository.findAll()
                .stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())
                        && p.getCallStatus() == CallStatus.PENDING)
                .toList();

        for (Patient patient : pendingPatients) {
            String phone = patient.getUser().getPhone();
            String name = patient.getUser().getName();
            String therapy = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic";

            boolean success = makeVoiceCall(phone, name, therapy);
            if (success) {
                patient.setCallStatus(CallStatus.ANSWERED);
                patientRepository.save(patient);
            }
            // Patients that still don't answer will be SMS-ed at 8:30 PM.
        }
        System.out.println("[AIVoiceService] 8:00 PM — Final-call round complete. "
                + pendingPatients.size() + " patient(s) attempted.");
    }

    /**
     * 8:30 PM — Send SMS to any patient whose call status is still PENDING
     * after all three voice call attempts. Marks them as MISSED.
     *
     * Tamil SMS text:
     * "Vanakkam, ungalukku nalaikku treatment irukkira dhu. Sariyaana nerathirku
     * varaavum."
     */
    @Scheduled(cron = "0 30 20 * * *")
    public void sendFallbackSms() {
        System.out.println("[AIVoiceService] 8:30 PM — Sending SMS to still-PENDING patients...");
        List<Patient> pendingPatients = patientRepository.findAll()
                .stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus())
                        && p.getCallStatus() == CallStatus.PENDING)
                .toList();

        String smsBody = "Vanakkam, ungalukku nalaikku treatment irukkira dhu. "
                + "Sariyaana nerathirku varaavum.";

        for (Patient patient : pendingPatients) {
            String phone = patient.getUser().getPhone();
            sendSms(phone, smsBody);
            patient.setCallStatus(CallStatus.MISSED);
            patientRepository.save(patient);
        }
        System.out.println("[AIVoiceService] 8:30 PM — SMS round complete. "
                + pendingPatients.size() + " patient(s) messaged.");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LOW-LEVEL TWILIO HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Initiates a Twilio voice call with a Tamil/English reminder message.
     *
     * @return true if the Twilio API accepted the call (does NOT guarantee the
     *         patient answered)
     *         false if an error occurred
     */
    public boolean makeVoiceCall(String phoneNumber, String patientName, String therapyName) {
        if (!isTwilioConfigured()) {
            String err = "[AIVoiceService] Twilio credentials not configured. Please set twilio.account.sid, twilio.auth.token, and twilio.phone.number in application.properties.";
            System.err.println(err);
            throw new RuntimeException("Twilio is not configured. Contact admin to set up voice calls.");
        }

        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new RuntimeException("Patient phone number is missing. Please update patient profile.");
        }

        String formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : "+91" + phoneNumber;

        String message = String.format(
                "Vanakkam %s, this is a reminder from AyurSutra. "
                        + "You have a %s treatment scheduled for tomorrow. Please be on time.",
                patientName, therapyName);

        try {
            String twiml = "<Response><Say language=\"en-IN\">" + message + "</Say></Response>";
            String twimlUrl = "http://twimlets.com/echo?Twiml="
                    + URLEncoder.encode(twiml, StandardCharsets.UTF_8);

            Call call = Call.creator(
                    new PhoneNumber(formattedPhone),
                    new PhoneNumber(twilioPhoneNumber),
                    URI.create(twimlUrl)).create();

            System.out.println("[AIVoiceService] Call initiated to " + formattedPhone
                    + " | SID: " + call.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("[AIVoiceService] Call FAILED to " + formattedPhone
                    + " | Error: " + e.getMessage());
            throw new RuntimeException("Twilio call failed: " + e.getMessage(), e);
        }
    }

    /**
     * Sends a plain-text Twilio SMS to the given phone number.
     */
    private void sendSms(String toNumber, String body) {
        if (!isTwilioConfigured()) {
            System.err.println("[AIVoiceService] Twilio not configured — skipping SMS to " + toNumber);
            return;
        }
        try {
            Message msg = Message.creator(
                    new PhoneNumber(toNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    body).create();
            System.out.println("[AIVoiceService] SMS sent to " + toNumber
                    + " | SID: " + msg.getSid());
        } catch (Exception e) {
            System.err.println("[AIVoiceService] SMS failed to " + toNumber
                    + " | Error: " + e.getMessage());
        }
    }

    // ── private utilities ────────────────────────────────────────────────────

    private boolean isTwilioConfigured() {
        return accountSid != null
                && !accountSid.isEmpty()
                && !"YOUR_ACCOUNT_SID_HERE".equals(accountSid);
    }

    /** Returns all patients with status == "ACTIVE" */
    private List<Patient> getActivePatients() {
        return patientRepository.findAll()
                .stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .toList();
    }
}
