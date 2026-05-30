-- =============================================
-- Add 3 Default Offerings for Every Puja
-- Run this AFTER running puja-offerings.sql
-- =============================================

-- This inserts 3 sacred offerings for every puja in your database.
-- Uses a cross join so you don't have to enter them manually.

INSERT INTO puja_offerings (puja_id, name, name_hi, price, description, description_hi, status, sort_order)
SELECT
  p.id,
  o.name,
  o.name_hi,
  o.price,
  o.description,
  o.description_hi,
  'active',
  o.sort_order
FROM pujas p
CROSS JOIN (
  VALUES
    (
      'Gau Seva',
      'गौ सेवा',
      251,
      'Serve a sacred cow in the name of the deity for blessings, good karma, and family prosperity.',
      'देवता के नाम पर एक पवित्र गाय की सेवा करें — आशीर्वाद, पुण्य और पारिवारिक समृद्धि के लिए।',
      1
    ),
    (
      'Deep Daan',
      'दीप दान',
      151,
      'Light 11 sacred diyas at the temple to remove darkness, negativity, and bring divine light into your life.',
      'मंदिर में 11 पवित्र दीपक जलाएं — अंधकार और नकारात्मकता दूर करें और जीवन में दिव्य प्रकाश लाएं।',
      2
    ),
    (
      'Phool Mala Arpan',
      'फूल माला अर्पण',
      101,
      'Offer a fresh flower garland to the deity during the puja for divine grace and blessings.',
      'पूजा के दौरान देवता को ताजे फूलों की माला अर्पित करें — दिव्य कृपा और आशीर्वाद के लिए।',
      3
    )
) AS o(name, name_hi, price, description, description_hi, sort_order)
-- Skip if offerings already exist for a puja (prevents duplicates on re-run)
WHERE NOT EXISTS (
  SELECT 1 FROM puja_offerings po
  WHERE po.puja_id = p.id AND po.name = o.name
);
