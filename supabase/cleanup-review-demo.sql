-- Buang semua data dan akaun yang diwujudkan oleh seed-review-demo.sql.
-- Rekod pengguna sebenar tidak disentuh.

begin;

delete from public.messages
where id::text like 'd8000000-%'
   or sender_id in ('d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003')
   or receiver_id in ('d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003');

delete from public.announcements where id::text like 'd6000000-%';
delete from public.events where id::text like 'd7000000-%';
delete from public.exam_results where exam_id::text like 'd4000000-%' or student_id::text like 'd2000000-%' or subject_id::text like 'd3000000-%';
delete from public.exams where id::text like 'd4000000-%';
delete from public.subjects where id::text like 'd3000000-%';
delete from public.invoices where student_id::text like 'd2000000-%' or fee_id::text like 'd5000000-%';
delete from public.fees where id::text like 'd5000000-%';
delete from public.behaviour where student_id::text like 'd2000000-%';
delete from public.hafazan where student_id::text like 'd2000000-%';
delete from public.tilawah where student_id::text like 'd2000000-%';
delete from public.attendance where student_id::text like 'd2000000-%';
delete from public.parents_students where parent_id = 'd0000000-0000-4000-8000-000000000003' or student_id::text like 'd2000000-%';
delete from public.students where id::text like 'd2000000-%';
delete from public.classes where id::text like 'd1000000-%';
delete from public.infaq_submissions where reference_no like 'DEMO-%' or id::text like 'd9000000-%';

delete from auth.users
where id in (
  'd0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000003'
);

update public.infaq_settings
set
  organization_name = 'Madrasah Hub',
  address = null,
  phone = null,
  bank_name = null,
  account_name = null,
  account_number = null,
  qr_image_url = null,
  payment_instructions = 'Sila imbas QR atau buat pindahan bank, kemudian muat naik bukti bayaran.',
  receipt_prefix = 'INF',
  email_subject = 'Pengesahan Infaq dan Resit Rasmi',
  email_body = 'Terima kasih atas sumbangan infaq anda. Resit rasmi dilampirkan bersama e-mel ini.',
  updated_at = now()
where id = 1;

commit;
