# Plan: Web Document Editor + Digital Signature POC

จากข้อมูล Research ที่ให้มา บวกกับ requirement เพิ่มเติม (import PDF หรือเลือก template แล้วให้ user แก้ text/format เอง) ผมจัดโครงสร้างโปรเจกต์ POC ให้ดังนี้ครับ
ภาพรวม Scope ที่ปรับตาม requirement ใหม่
การเพิ่ม "import PDF" เข้ามาทำให้ POC มี 2 เส้นทางเข้าสู่ editor:

Path A: เลือก Template → โหลดเอกสารที่เตรียมไว้แล้ว (เป็น JSON/HTML structure ที่ editor เข้าใจ) → user แก้ไขได้ทันที (ทางนี้ตรงไปตรงมา)

<!-- Path B: Import PDF → ต้องแปลง PDF เป็นเนื้อหาที่แก้ไขได้ (editable) ก่อน ซึ่งเป็นจุดที่ยากที่สุดของโปรเจกต์ทั้งหมด เพราะ PDF ไม่ได้เก็บโครงสร้างเอกสาร (paragraph, table) แบบที่ editor ต้องการ ต้องอาศัย PDF parsing/OCR แล้ว "เดา" โครงสร้างกลับมา ความแม่นยำมักไม่ 100% โดยเฉพาะเอกสารราชการที่มีตาราง/ตรา/ลายเซ็นแทรกอยู่ -->

ผมแนะนำให้แยก POC นี้เป็น track ที่ 3 ต่างหาก เพราะ complexity ต่างจาก 2 งานเดิมมาก และควรทดสอบว่า "คุ้มที่จะทำ" หรือควรจำกัดสิทธิ์ไว้แค่ import DOCX (ซึ่งมีโครงสร้างชัดเจนกว่า PDF มาก) แล้วให้ PDF เป็นแค่ export-only

# โครงสร้างโปรเจกต์ (4 Tracks)

## Track 1: Editor Core Evaluation (1–1.5 สัปดาห์)

ทดสอบ editor library แต่ละตัวกับ requirement เอกสารราชการไทย
หัวข้อทดสอบรายละเอียดFont & LayoutTH Sarabun, ขนาด A4, ระยะขอบตามระเบียบสำนักนายกฯRich formattingย่อหน้า, ตาราง, รูปภาพ, การจัดกึ่งกลาง/ชิดขอบHeader/Footer/เลขหน้ามักเป็นจุดอ่อนของ editor แบบ web (ต่างจาก native word processor) — ต้องเช็คว่าตัวไหนรองรับจริงPagination (แบ่งหน้าอัตโนมัติ)สำคัญมากสำหรับพิมพ์/PDF — ProseMirror/TipTap ไม่มี built-in ต้องทำเอง, Lexical ก็เช่นกัน
ตัวที่แนะนำให้ priority ทดสอบก่อน: TipTap (built on ProseMirror, มี ecosystem/extension เยอะ, ลด dev effort) → ถ้าไม่พอค่อยลง ProseMirror ตรงๆ
Deliverable: ตาราง comparison (ความสามารถ, ปริมาณ effort ที่ต้อง custom, license, ขนาด bundle, community/maintenance status)

## Track 2: Template Flow + Import/Export (1 สัปดาห์)

สร้างเอกสารราชการตัวอย่าง 2–3 แบบ (เช่น หนังสือภายใน, หนังสือประทับตรา) เป็น template ในระบบ
ทดสอบ export → DOCX (ใช้ library เช่น docx npm หรือแปลงผ่าน server-side) และ PDF (print CSS หรือ headless Chrome/puppeteer)
ทดสอบ import DOCX กลับเข้า editor (ตรวจสอบว่ารูปแบบเพี้ยนแค่ไหน)
ทดสอบ import PDF → editable (fallback plan ถ้าแม่นยำต่ำ)

Deliverable: ตัวอย่างเอกสาร before/after round-trip พร้อมระบุ % ความเพี้ยนของ format

## Track 3: Digital Signature POC (1 สัปดาห์)

จัดเก็บลายเซ็น: เก็บเป็น PNG พื้นหลังโปร่งใส (ง่าย, ตรงไปตรงมา) — SVG ให้ผลคมกว่าแต่ต้องมี input เป็น vector (วาดบนหน้าจอ) ซึ่งซับซ้อนกว่า
Drag & drop วางบนตำแหน่งในเอกสาร (ทดสอบกับ layer แยกจาก text layer เพื่อไม่ให้กระทบ text flow)
รองรับหลายผู้ลงนาม (เก็บ metadata: ตำแหน่ง, ขนาด, ผู้ลงนาม, timestamp)
Export เป็น PDF แล้วตรวจสอบว่าลายเซ็นอยู่ตำแหน่งเดิม ไม่เบลอ ไม่หลุด layer

หมายเหตุ: ควรแยกให้ชัดว่านี่คือ "ลายเซ็นภาพ" (visual signature) ไม่ใช่ digital signature แบบ PKI/certificate ที่ใช้ยืนยันตัวตนทางกฎหมาย (เช่น ตาม พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์) — ถ้าโปรเจกต์จริงต้องการความน่าเชื่อถือทางกฎหมาย ควรวางแผนเพิ่มการเซ็นด้วย certificate (เช่น ผ่าน NDID หรือ CA ที่ได้รับรอง) เป็น phase ถัดไป

## Track 4: Integration Test (2–3 วัน)

รวม 3 track เข้าด้วยกันเป็น flow เดียว: เลือก template/import PDF → แก้ไขเอกสาร → ใส่ลายเซ็น → export PDF สุดท้าย แล้วทดสอบ end-to-end ว่า format ไม่พัง

Timeline รวม (ประมาณ)
สัปดาห์งาน1–1.5Track 1: Editor evaluation1.5–2.5Track 2: Template/Import-Export (คู่ขนานกับปลาย Track 1 ได้)2.5–3.5Track 3: Digital Signature3.5–4Track 4: Integration + สรุปผล
รวมประมาณ 4 สัปดาห์ สำหรับทีมขนาดเล็ก (1–2 dev)
สิ่งที่ต้องสรุปตอนจบ (ตามที่ระบุไว้)

เทคโนโลยีที่เหมาะสม (editor + วิธี export/import)
ข้อดี/ข้อจำกัดของแต่ละตัว
License และต้นทุน (โดยเฉพาะเช็ค TinyMCE ให้ดี เพราะ license เปลี่ยนบ่อย ต้องยืนยันสถานะปัจจุบันตอนทำ POC จริง)
ความเป็นไปได้ในการพัฒนาระบบจริง — รวมถึงประเมินว่า PDF import ควรอยู่ใน scope จริงหรือควรตัดออกไปเป็น manual process
