---
id: nfc-blog-018
title: "NFC Safe: Verschlüsselte Geheimnisse auf langlebigen NFC-Tags speichern"
date: 2026-05-03
tags: [nfc-tech, security, encryption, privacy]
summary: "Deine Seed Phrase liegt auf Papier. Papier vergeht. NFC Safe nutzt 256-Bit-AES-Verschlüsselung auf epoxy-beschichteten NFC-Tags, die wasserfest, stoßsicher und für Jahrzehnte haltbar sind. Keine Cloud, kein Server, kein Account. Nur ein physischer Tag und ein Passwort."
metaTitle: "NFC Safe: Verschlüsselte Geheimnisse auf langlebigen NFC-Tags (2026)"
metaDescription: "Speichere verschlüsselte Passwörter, Seed Phrases und Wiederherstellungscodes auf NFC-Tags mit 256-Bit-AES-Verschlüsselung. Keine Cloud, kein Account, kein Akku. Epoxy-beschichtete Tags sind wasserfest und langlebig."
ogTitle: "NFC Safe: Verschlüsselte Geheimnisse auf langlebigen NFC-Tags"
ogDescription: "Deine Seed Phrase liegt auf einem Stück Papier. Papier vergeht. NFC Safe verschlüsselt Geheimnisse auf langlebigen NFC-Tags, die Jahrzehnte überdauern."
---

Deine Seed Phrase liegt auf einem Stück Papier.

Vielleicht im Tresor. Vielleicht unter einer Diele. Vielleicht auf drei Orte verteilt, weil jemand auf Reddit sagte, das machen "ernsthafte" Crypto-Leute. Aber es ist immer noch Papier. Papier brennt. Papier geht unter. Papier geht verloren.

Was wäre, wenn dein Backup nicht verrotten könnte, nicht zerfallen und für jeden, der es findet, wie nichts aussehen würde?

Genau das macht NFC Safe. Es verschlüsselt jeden Text - Seed Phrases, Passwörter, Wiederherstellungscodes, was immer du geheim halten willst - auf einen NFC-Tag mit 256-Bit-AES-Verschlüsselung. Der Tag ist in sich geschlossen. Keine Cloud. Kein Server. Kein Account. Um das Geheimnis zu lesen, brauchst du den physischen Tag *und* das Passwort. Ohne beides ist der Tag nur ein winziges Plastikteil mit Kauderwelsch drauf.

Das Verschlüsselungsformat ist [vollständig dokumentiert und offen](https://github.com/NickAtGit/nfc.cool-nfc-safe-format), inklusive eines Python-Referenz-Decoders. Deine Geheimnisse hängen nicht davon ab, dass die App existiert - falls NFC.cool jemals verschwindet, kannst du deine Daten trotzdem mit einem handelsüblichen NFC-Lesegerät und der Spezifikation wiederherstellen.

Ich habe NFC Safe gebaut, weil ich meine eigenen Passwörter redundant auf physischen Tags speichern wollte, die ich an verschiedenen Orten verteilen kann. Wenn an einem Ort etwas passiert, überlebt ein anderer Tag. Wenn jemand einen Tag findet, kann er ihn nicht lesen. Es ist die einfachste redundante Geheimnisspeicherung, die ich mir vorstellen konnte.

---

## Das Problem mit der Geheimnisaufbewahrung

Jede Methode, ein Geheimnis zu speichern, hat eine Schwachstelle:

- **Papier** brennt, geht unter, zerfällt, geht verloren
- **USB-Sticks** haben Anschlüsse, die korrodieren, und Dateisysteme, die korrumpieren
- **Cloud-Passwortmanager** sind toll, bis der Service ausfällt, gehackt wird oder du den Zugang zu deinem Account verlierst
- **Hardware-Wallets** sind hervorragend für Crypto, speichern aber keine beliebigen Texte wie Wiederherstellungscodes oder Passwörter für andere Dienste
- **Dein Gehirn** vergisst, und du kannst ein Geheimnis nicht einfach an jemand anderen weitergeben

Das ideale Backup wäre:
1. **Physisch langlebig** - übersteht Wasser, Stöße und Jahrzehnte der Vernachlässigung
2. **Verschlüsselt** - nutzlos für jeden, der es findet
3. **In sich geschlossen** - keine Abhängigkeit von einem Service, einer App oder einem Account
4. **Redundant** - günstig genug, um an mehreren Orten zu deponieren
5. **Langlebig** - kein Akku, der stirbt, keine Festplatte, die zerfällt

NFC-Tags erfüllen alle fünf Punkte. Sie haben keinen Akku, keine beweglichen Teile, und der NTAG216-Chip darin wird vom Hersteller für 10 Jahre Datenaufbewahrung zertifiziert - in der Praxis ist das bei normaler Zimmertemperatur aber wahrscheinlich deutlich länger. Epoxy-beschichtete Varianten sind wasserfest, halten Stöße gut aus und sind zäh genug, um überstanden zu werden, herunterzufallen oder vergraben zu werden. Sie überstehen kein Hausfeuer - kein kleines Plastikteil tut das - aber wenn du Tags über mehrere Orte verteilst, muss kein einzelner Tag unzerstörbar sein.

---

## So verwendest du NFC Safe

NFC Safe befindet sich in NFC.cool Tools unter dem Bereich NFC Apps. Zwischen Encrypt und Decrypt wählst du mit der Segmentsteuerung oben.

**Um ein Geheimnis auf einen Tag zu verschlüsseln:**

1. Öffne **NFC.cool Tools** und gehe zu **NFC Apps > NFC Safe**
2. Stelle sicher, dass der Reiter **Encrypt** ausgewählt ist
3. Tippe oder füge deinen geheimen Text ein
4. Lege ein Passwort fest - verwende für echte Sicherheit ein langes, zufällig generiertes (siehe [Sicherheitshinweise](#sicherheitshinweise) unten)
5. Tippe auf **Encrypt**
6. Halte einen NFC-Tag an dein Telefon - die App schreibt die verschlüsselten Daten auf den Tag

<div style="text-align: center;">

![NFC Safe Ver- und Entschlüsselungsablauf: Geheimnis und Passwort eingeben, Tag scannen zum Verschlüsseln, dann zum Entschlüsseln wechseln, Passwort eingeben, Tag scannen, um das Geheimnis anzuzeigen](/assets/blog/nfc-safe-flow.png)

</div>

**Um einen Tag zu entschlüsseln und dein Geheimnis zu lesen:**

1. Öffne **NFC.cool Tools** und gehe zu **NFC Apps > NFC Safe**
2. Wechsle zum Reiter **Decrypt**
3. Gib dein Passwort ein
4. Tippe auf **Decrypt**
5. Halte den Tag an dein Telefon
6. Dein Geheimnis wird auf dem Bildschirm angezeigt

Unter der Haube nutzt NFC Safe AES-256-GCM-Verschlüsselung mit einem Schlüssel, der aus deinem Passwort via PBKDF2 abgeleitet wird (HMAC-SHA-256, 100.000 Iterationen, 16 Byte zufälliges Salt). Die Daten werden auf dem Tag in einem eigenen NDEF-Record-Format gespeichert (`urn:nfc:ext:crypto`). Das Format ist [vollständig dokumentiert und offen](https://github.com/NickAtGit/nfc.cool-nfc-safe-format) - falls NFC.cool in 15 Jahren verschwindet, kannst du deine Daten trotzdem mit einem handelsüblichen NFC-Lesegerät und einem 30-zeiligen Python-Skript wiederherstellen.

Ein Hinweis zum NDEF-Typ: `urn:nfc:ext:crypto` verrät, dass ein Tag verschlüsselte Daten enthält. Es verrät nicht, *was* verschlüsselt ist, aber es markiert den Tag als lohnendes Angriffsziel für einen entschlossenen Angreifer. Deine Sicherheit beruht auf der Stärke des Passworts, nicht auf der Verschleierung des Formats.

---

## Die Redundanz-Strategie

Hier wird es interessant. Ein NTAG216-Tag kostet ungefähr so viel wie eine Tasse Kaffee. Du kannst ein paar epoxy-beschichtete Tags kaufen und dasselbe Geheimnis auf mehrere Tags verschlüsseln, dann verteilen:

- Einen in der Schreibtischschublade zu Hause
- Einen im Büro
- Einen bei einem Familienmitglied
- Einen im Bankschließfach
- Einen versteckt, wo auch immer du Dinge versteckst

Jeder Tag allein ist ohne das Passwort bedeutungslos. Jemand bricht in dein Büro ein und findet eine kleine Plastikscheibe? Er kann sie nicht lesen. Er müsste wissen, dass es ein NFC-Tag ist, wissen, dass er NFC.cool Tools braucht, und dein Passwort kennen. Der physische Tag und das Passwort sind zwei separate Faktoren, die an zwei separaten Orten aufbewahrt werden.

Das ist dasselbe Prinzip wie das Seed-Phrase-Backup einer Hardware-Wallet, nur angewendet auf jedes Geheimnis und ohne die 100+-Dollar-Hardware.

---

## Warum NFC, nicht USB oder SD-Karte

NFC-Tags haben spezifische Vorteile für die Geheimnisspeicherung:

- **Kein Anschluss** - nichts, was korrodieren, verbiegen oder brechen kann. USB-Sticks haben physische Anschlüsse. SD-Karten haben Kontakte. NFC-Tags sind eine Spule und ein Chip, versiegelt in Epoxy.
- **Kein Akku** - passive NFC-Tags werden vom elektromagnetischen Feld des Lesegeräts mit Strom versorgt. Sie können nicht in einer Schublade sterben.
- **Kein Dateisystem** - nichts, was korrumpieren kann. Die Daten werden direkt auf die Speicherseiten des Chips geschrieben.
- **Kein Treiber** - jedes Smartphone kann NFC lesen. Kein Kabel, kein Adapter, keine Treiberinstallation.
- **Klein und günstig** - ein NTAG216-Tag ist etwa münzgroß und kostet in Mengen unter einem Dollar. Du kannst sie überall hinlegen.
- **Langlebig** - epoxy-beschichtete Varianten widerstehen Wasser, Stößen und UV-Strahlung. Sie sind nicht unzerstörbar - Feuer schmilzt sie - aber sie sind bemerkenswert zäh für etwas von der Größe einer Münze.

Die Hauptbegrenzung ist die Speicherkapazität. Ein NTAG216 hat 888 Byte Nutzerspeicher. Nach dem Verschlüsselungs-Overhead und der NDEF-Formatierung kannst du je nach Passwortlänge grob 500-700 Byte Klartext speichern. Das reicht locker für eine Seed Phrase (typischerweise 24 Wörter, ~200 Byte), ein langes Passwort oder ein paar Wiederherstellungscodes. Es reicht nicht für eine ganze Passwortdatenbank - nutze dafür einen Passwortmanager und lege das Master-Passwort auf einen NFC-Tag.

---

## Was du auf einem NFC-Safe-Tag speichern kannst

Praktische Anwendungsfälle:

- **Crypto-Seed Phrases** - der naheliegendste. 12 oder 24 Wörter, passen leicht auf einen Tag
- **Master-Passwörter von Passwortmanagern** - dein 1Password-, Bitwarden- oder KeePass-Masterschlüssel
- **Zwei-Faktor-Wiederherstellungscodes** - die Backup-Codes, die Google, Apple und jeder andere Dienst dir gibt
- **Verschlüsselungsschlüssel** - PGP-Private-Keys, SSH-Keys, VeraCrypt-Passwörter
- **Notfallkontaktinfos** - verschlüsselte Angaben zu Angehörigen, medizinische Informationen, Versicherungsnummern
- **Dead Man's Switch** - ein Geheimnis, das jemand nur finden soll, wenn er weiß, dass er danach suchen muss, *und* das Passwort hat, das du ihm gegeben hast

---

## Was du brauchst

1. **Epoxy-beschichtete NTAG216-Tags** - die 216-Variante (888 Byte) bietet den meisten Speicher. Epoxy-Beschichtung macht sie wasserfest und langlebig. [Amazon US](https://www.amazon.com/gp/search/ref=as_li_qf_sp_sr_tl?ie=UTF8&amp;tag=1337420050185-20&amp;keywords=ntag216&amp;index=aps&amp;camp=1789&amp;creative=9325&amp;linkCode=ur2&amp;linkId=a65cf3348c895e55dc070ca310ff04bd) | [Amazon Europe](https://www.amazon.de/gp/search/ref=as_li_qf_sp_sr_tl?ie=UTF8&amp;tag=1337420050185-21&amp;keywords=ntag%20216&amp;index=aps&amp;camp=1638&amp;creative=6742&amp;linkCode=ur2&amp;linkId=e0129c686012578ed3d03d0b7fd73894) (Affiliate-Links)
2. **NFC.cool Tools** auf dem [iPhone](https://apps.apple.com/app/apple-store/id1249686798?pt=106913804&amp;ct=BlogNfcSafe&amp;mt=8) (Android kommt bald)
3. **Ein starkes, zufällig generiertes Passwort** - siehe Sicherheitshinweise unten

---

## Sicherheitshinweise

Ein paar Dinge, über die man ehrlich sein sollte:

- **Dein Passwort ist alles.** 256-Bit-AES ist praktisch unknackbar. Dein 6-Zeichen-Passwort nicht. Die App schlägt 20+ Zeichen vor, aber Länge allein ist keine Sicherheit - Entropie ist es. `correcthorsebatterystaple` hat 28 Zeichen, aber nur ~44 Bit Entropie. Eine 20-stellige zufällig generierte Zeichenkette (Groß-/Kleinschreibung, Ziffern, Sonderzeichen) hat ~120 Bit. NFC Safe nutzt PBKDF2 mit 100.000 Iterationen, um Brute-Force zu verlangsamen, aber das ist eine Tempobegrenzung, keine Mauer. Verwende für echte Sicherheit ein zufällig generiertes Passwort.
- **NFC-Reichweite ist kurz.** NFC funktioniert auf ~4 cm. Niemand scannt deine Tags vom anderen Ende des Zimmers. Aber wenn jemand physischen Zugang zum Tag und die richtige App hat, kann er einen Entschlüsselungsversuch starten. Ein starkes Passwort macht das irrelevant.
- **Kein Remote-Löschen.** Wenn ein Tag verloren geht, kannst du ihn nicht fernlöschen. Das ist ein Feature, kein Bug - der Tag hat keine Netzwerkverbindung. Wenn du dir Sorgen machst, dass ein bestimmter Tag kompromittiert wurde, zerstöre ihn physisch. Eine Schere reicht bei den meisten Tags. Ein Bolzenschneider bei allen.
- **Passwort-Wiederherstellung.** Gibt es nicht. Wenn du dein Passwort vergisst, sind die Daten weg. Das ist Absicht - kein Hintertürchen für dich heißt auch kein Hintertürchen für jemand anderen. Schreib dein Passwort irgendwo auf, getrennt von den Tags, oder verwende ein Muster, das du dir merken wirst.

---

## Das größere Bild

NFC-Tags werden zum Speichermedium für Dinge, die zählen. Der [EU Digital Product Passport](/blog/eu-digital-product-passport-2026/) erlaubt NFC als einen von mehreren Datenträgern, neben QR-Codes und RFID. Philips [baut sie in Zahnbürstenköpfe ein](/blog/reset-sonicare-brush-head-nfc/), um Austauschzyklen zu verfolgen. Hotels nutzen sie für Zimmerkarten. Sie sind günstig, langlebig und universell lesbar mit dem Gerät, das du ohnehin in der Tasche hast.

NFC Safe nimmt diese Langlebigkeit und fügt Verschlüsselung hinzu. Das Ergebnis ist ein Backup, das Papier überdauert, von niemandem gelesen werden kann, der es findet, und weniger kostet als eine Tasse Kaffee. Kein einzelner Tag muss alles überstehen - dafür gibt es Redundanz.

Keine Abos, keine Cloud-Abhängigkeit. Und auch kein Vendor-Lock-in - das [Verschlüsselungsformat ist vollständig dokumentiert](https://github.com/NickAtGit/nfc.cool-nfc-safe-format) mit einem Python-Referenz-Decoder. Deine Geheimnisse hängen nicht von unseren Servern ab, unserer App oder unserem Unternehmen.

Manchmal ist die beste Technologie die, die im Hintergrund verschwindet und einfach jahrzehntelang funktioniert. Das ist ein NFC-Tag mit deinem Geheimnis darauf, vergraben unter einer Diele, wartend bis zu dem Tag, an dem du es brauchst.

---

*Bereit, deine Geheimnisse auf etwas zu speichern, das überlebt? [Lade NFC.cool Tools für iPhone herunter](https://apps.apple.com/app/apple-store/id1249686798?pt=106913804&amp;ct=BlogNfcSafe&amp;mt=8) und probiere NFC Safe noch heute. Bald auch für [Android](https://play.google.com/store/apps/details?id=cool.nfc&amp;referrer=utm_source%3Dblog-nfc-safe).*