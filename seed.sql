-- ============================================================
-- ABZ MARKET — To'liq seed data (Uzum Market uslubida)
-- MUHIM: TRUNCATE ishlatilmaydi — foydalanuvchi ma'lumotlari saqlanadi!
-- Kategoriyalar ON CONFLICT DO NOTHING bilan xavfsiz qo'shiladi
-- ============================================================

-- ============================================================
-- 1. ASOSIY KATEGORIYALAR (15 ta)
-- c1xxxxxx = main category
-- ============================================================
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c1000000-0000-0000-0000-000000000001','Mebel','🛋️','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',1,NULL),
('c1000000-0000-0000-0000-000000000002','Uy-ro''zg''or','🏠','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',2,NULL),
('c1000000-0000-0000-0000-000000000003','Maishiy texnika','📺','https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=300&fit=crop',3,NULL),
('c1000000-0000-0000-0000-000000000004','Yotoq to''shaklari','🛏️','https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=300&fit=crop',4,NULL),
('c1000000-0000-0000-0000-000000000005','Qurilish va ta''mirlash','🏗️','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',5,NULL),
('c1000000-0000-0000-0000-000000000006','Yorug''lik','💡','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',6,NULL),
('c1000000-0000-0000-0000-000000000007','Bog'' va hovli','🌿','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',7,NULL),
('c1000000-0000-0000-0000-000000000008','Dekor va bezak','🖼️','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',8,NULL),
('c1000000-0000-0000-0000-000000000009','Elektronika','📱','https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',9,NULL),
('c1000000-0000-0000-0000-000000000010','Kiyimlar','👗','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop',10,NULL),
('c1000000-0000-0000-0000-000000000011','Poyabzal','👟','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',11,NULL),
('c1000000-0000-0000-0000-000000000012','Go''zallik va parvarish','💄','https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',12,NULL),
('c1000000-0000-0000-0000-000000000013','Avtotovarlar','🚗','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop',13,NULL),
('c1000000-0000-0000-0000-000000000014','Bolalar tovarlari','🧸','https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop',14,NULL),
('c1000000-0000-0000-0000-000000000015','Aksessuarlar','👜','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',15,NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. SUBKATEGORIYALAR (c2xxxxxx)
-- Mebel subs: c2000000-0001-xxxx
-- ============================================================
-- Mebel subkategoriyalari (13 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0001-0000-0000-000000000001','Divonlar','🛋️','https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400',1,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000002','Yotoqona','🛏️','https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=400',2,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000003','Oshxonalar','🪑','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/7scd4frm_f95026e46c2bafd38e7ed2161b525785.webp',3,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000004','Bola xonasi','🧒','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/46fzfgci_what-should-be-a-childrens-room-for-a-girl-layout-colors-and-design.webp',4,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000005','Ofis mebeli','💼','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/ciguc262_74412799b8fcbf84ab07d2ebc41bfe7e.webp',5,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000006','Shkaflar','🚪','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/8jtzh2pv_without-handle.webp',6,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000007','Stollar','🪑','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/tkjayp8v_1737548602.webp',7,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000008','Vannaxona mebellar','🚿','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/xq09rjmd_img-20240212-231943-539.jpg',8,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000009','Karavotlar','🛏️','https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400',9,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000010','Stullar','🪑','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/pfbsxkfx_4454654.jpg',10,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000011','Komodlar','🗄️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/pqt6xxhg_t_product_540_high.webp',11,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000012','Javonlar','📚','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/uaat8o2r_image.webp',12,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000013','Kreslo','🪑','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/bz1xatyt_4365012.jpg',13,'c1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Uy-ro'zg'or subkategoriyalari (6 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0002-0000-0000-000000000001','Idish-tovoq','🍽️','https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',1,'c1000000-0000-0000-0000-000000000002'),
('c2000000-0002-0000-0000-000000000002','Pishirish idishlari','🥘','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/cidpuyh8_pishirish%20idishlar.jpeg',2,'c1000000-0000-0000-0000-000000000002'),
('c2000000-0002-0000-0000-000000000003','Dasturxon bezaklari','🎂','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/ucovcku9_dasturxon%20bezaklari.webp',3,'c1000000-0000-0000-0000-000000000002'),
('c2000000-0002-0000-0000-000000000004','Tozalash buyumlari','🧹','https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',4,'c1000000-0000-0000-0000-000000000002'),
('c2000000-0002-0000-0000-000000000005','Saqlash va tartib','📦','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/525k5gsq_saqlash%20va%20tartib.jpg',5,'c1000000-0000-0000-0000-000000000002'),
('c2000000-0002-0000-0000-000000000006','Hammom aksessuarlar','🛁','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',6,'c1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Maishiy texnika subkategoriyalari (7 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0003-0000-0000-000000000001','Muzlatgichlar','❄️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/us3ok51t_muzlatgich.jpg',1,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000002','Kir yuvish mashinalari','🌀','https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400',2,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000003','Televizorlar','📺','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/v073hsv9_televezor.jpg',3,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000004','Konditsionerlar','🌬️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/vvtsik30_konditsioner.webp',4,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000005','Oshxona texnikasi','🍳','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/j2f1cuyj_misirupka.webp',5,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000006','Changyutgich','🧹','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/krxlxob4_chang%20yutgich.jpg',6,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000007','Isitgich va ventilyator','🌡️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/dcbub0wt_ventilyator.webp',7,'c1000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Yotoq to'shaklari subkategoriyalari (5 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0004-0000-0000-000000000001','Matraslar','🛏️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/okpljsns_photo_5195110656934352874_x.jpg',1,'c1000000-0000-0000-0000-000000000004'),
('c2000000-0004-0000-0000-000000000002','Ko''rpalar va yostiqlar','🌙','https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400',2,'c1000000-0000-0000-0000-000000000004'),
('c2000000-0004-0000-0000-000000000003','Choyshab to''plamlar','🛏️','https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=400',3,'c1000000-0000-0000-0000-000000000004'),
('c2000000-0004-0000-0000-000000000004','Dekorativ yostiqlar','🎀','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400',4,'c1000000-0000-0000-0000-000000000004'),
('c2000000-0004-0000-0000-000000000005','Uy pardalar','🪟','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/h6w6jf3x_pardalar.jpg',5,'c1000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- Qurilish va ta'mirlash subkategoriyalari (6 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0005-0000-0000-000000000001','Pol qoplamalar','🪵','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/ephozvdp_photo_5197362456748036646_y.jpg',1,'c1000000-0000-0000-0000-000000000005'),
('c2000000-0005-0000-0000-000000000002','Devor qoplamalar','🧱','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/hzi1ja24_photo_5197362456748036653_x.jpg',2,'c1000000-0000-0000-0000-000000000005'),
('c2000000-0005-0000-0000-000000000003','Bo''yoqlar va laklar','🎨','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/hrmes5ff_bo%27yoqlar.jpg',3,'c1000000-0000-0000-0000-000000000005'),
('c2000000-0005-0000-0000-000000000004','Santexnika','🚿','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/fvu3caa9_santexnika.jpeg',4,'c1000000-0000-0000-0000-000000000005'),
('c2000000-0005-0000-0000-000000000005','Elektr materiallari','⚡','https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400',5,'c1000000-0000-0000-0000-000000000005'),
('c2000000-0005-0000-0000-000000000006','Eshik va derazalar','🚪','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/21pvim81_photo_5197362456748036655_x%20%281%29.jpg',6,'c1000000-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- Yorug'lik subkategoriyalari (5 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0006-0000-0000-000000000001','Chiroqlar','✨','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',1,'c1000000-0000-0000-0000-000000000006'),
('c2000000-0006-0000-0000-000000000002','Devor chiroqlari','💡','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/pqmd0dsh_photo_5197362456748036656_y.jpg',2,'c1000000-0000-0000-0000-000000000006'),
('c2000000-0006-0000-0000-000000000003','Stol va pol chiroqlari','🕯️','https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',3,'c1000000-0000-0000-0000-000000000006'),
('c2000000-0006-0000-0000-000000000004','LED va smart chiroqlar','🔆','https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400',4,'c1000000-0000-0000-0000-000000000006'),
('c2000000-0006-0000-0000-000000000005','Ko''cha va bog'' chiroqlar','🌟','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/og0z9bo4_photo_5197362456748036665_y.jpg',5,'c1000000-0000-0000-0000-000000000006')
ON CONFLICT (id) DO NOTHING;

-- Dekor va bezak subkategoriyalari (6 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0008-0000-0000-000000000001','Rasmlar va suratlar','🖼️','https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',1,'c1000000-0000-0000-0000-000000000008'),
('c2000000-0008-0000-0000-000000000002','Vazalar va guldanlar','🌸','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/4e9qhitc_photo_5197362456748036669_y.jpg',2,'c1000000-0000-0000-0000-000000000008'),
('c2000000-0008-0000-0000-000000000003','Devor soatlari','🕐','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/jfx2lfcd_photo_5197362456748036671_y.jpg',3,'c1000000-0000-0000-0000-000000000008'),
('c2000000-0008-0000-0000-000000000004','Gilamlar','🎨','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/qybmzo1d_photo_5197362456748036687_x.jpg',4,'c1000000-0000-0000-0000-000000000008'),
('c2000000-0008-0000-0000-000000000005','Pardalar','🪟','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/ivglqcp8_photo_5197362456748036690_y.jpg',5,'c1000000-0000-0000-0000-000000000008'),
('c2000000-0008-0000-0000-000000000006','Dekorativ yostiqlar','🎀','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400',6,'c1000000-0000-0000-0000-000000000008')
ON CONFLICT (id) DO NOTHING;

-- Bog' va hovli subkategoriyalari (5 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0007-0000-0000-000000000001','Hovli mebellar','🪑','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',1,'c1000000-0000-0000-0000-000000000007'),
('c2000000-0007-0000-0000-000000000002','Bog'' uskunalari','🌱','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',2,'c1000000-0000-0000-0000-000000000007'),
('c2000000-0007-0000-0000-000000000003','Barbeque va piknik','🔥','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',3,'c1000000-0000-0000-0000-000000000007'),
('c2000000-0007-0000-0000-000000000004','Suv ta''minoti','💧','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',4,'c1000000-0000-0000-0000-000000000007'),
('c2000000-0007-0000-0000-000000000005','Hovli va bog'' bezak','🌸','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',5,'c1000000-0000-0000-0000-000000000007')
ON CONFLICT (id) DO NOTHING;

-- Elektronika subkategoriyalari (7 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0009-0000-0000-000000000001','Smartfonlar','📱','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',1,'c1000000-0000-0000-0000-000000000009'),
('c2000000-0009-0000-0000-000000000002','Noutbuklar','💻','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',2,'c1000000-0000-0000-0000-000000000009'),
('c2000000-0009-0000-0000-000000000003','Planshetlar','📲','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',3,'c1000000-0000-0000-0000-000000000009'),
('c2000000-0009-0000-0000-000000000004','Audio texnika','🎧','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',4,'c1000000-0000-0000-0000-000000000009'),
('c2000000-0009-0000-0000-000000000005','Kamera va foto','📷','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',5,'c1000000-0000-0000-0000-000000000009'),
('c2000000-0009-0000-0000-000000000006','Smartwatch va tracker','⌚','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',6,'c1000000-0000-0000-0000-000000000009'),
('c2000000-0009-0000-0000-000000000007','Kompyuter va aksessuarlar','🖥️','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',7,'c1000000-0000-0000-0000-000000000009')
ON CONFLICT (id) DO NOTHING;

-- Kiyimlar subkategoriyalari (5 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0010-0000-0000-000000000001','Erkaklar kiyimlari','👔','https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',1,'c1000000-0000-0000-0000-000000000010'),
('c2000000-0010-0000-0000-000000000002','Ayollar kiyimlari','👗','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',2,'c1000000-0000-0000-0000-000000000010'),
('c2000000-0010-0000-0000-000000000003','Bolalar kiyimlari','👶','https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',3,'c1000000-0000-0000-0000-000000000010'),
('c2000000-0010-0000-0000-000000000004','Sport kiyimlari','🏋️','https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=400',4,'c1000000-0000-0000-0000-000000000010'),
('c2000000-0010-0000-0000-000000000005','Ichki kiyim','🩱','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',5,'c1000000-0000-0000-0000-000000000010')
ON CONFLICT (id) DO NOTHING;

-- Poyabzal subkategoriyalari (4 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0011-0000-0000-000000000001','Erkaklar poyabzali','👞','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/w7gdg5th_photo_5197362456748036693_x.jpg',1,'c1000000-0000-0000-0000-000000000011'),
('c2000000-0011-0000-0000-000000000002','Ayollar poyabzali','👠','https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',2,'c1000000-0000-0000-0000-000000000011'),
('c2000000-0011-0000-0000-000000000003','Bolalar poyabzali','👟','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/vih2ob8a_photo_5197362456748036695_y.jpg',3,'c1000000-0000-0000-0000-000000000011'),
('c2000000-0011-0000-0000-000000000004','Sport poyabzali','🏃','https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400',4,'c1000000-0000-0000-0000-000000000011')
ON CONFLICT (id) DO NOTHING;

-- Go'zallik va parvarish subkategoriyalari (5 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0012-0000-0000-000000000001','Parfyumeriya','🌸','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/ryv1dpko_photo_5197362456748036700_y.jpg',1,'c1000000-0000-0000-0000-000000000012'),
('c2000000-0012-0000-0000-000000000002','Makiyaj','💄','https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',2,'c1000000-0000-0000-0000-000000000012'),
('c2000000-0012-0000-0000-000000000003','Soch mahsulotlari','💇','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',3,'c1000000-0000-0000-0000-000000000012'),
('c2000000-0012-0000-0000-000000000004','Teri parvarishi','🧴','https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',4,'c1000000-0000-0000-0000-000000000012'),
('c2000000-0012-0000-0000-000000000005','Erkaklar parvarishi','🪒','https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',5,'c1000000-0000-0000-0000-000000000012')
ON CONFLICT (id) DO NOTHING;

-- Avtotovarlar subkategoriyalari (5 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0013-0000-0000-000000000001','Avto aksessuarlar','🔧','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',1,'c1000000-0000-0000-0000-000000000013'),
('c2000000-0013-0000-0000-000000000002','Moy va suyuqliklar','🛢️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/jw8ddg4h_photo_5197362456748036705_y.jpg',2,'c1000000-0000-0000-0000-000000000013'),
('c2000000-0013-0000-0000-000000000003','Shinalar va disklar','🔩','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/do4cqv1w_photo_5197362456748036706_y.jpg',3,'c1000000-0000-0000-0000-000000000013'),
('c2000000-0013-0000-0000-000000000004','Avto elektronika','📟','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/gw59ofeq_photo_5197362456748036710_y.jpg',4,'c1000000-0000-0000-0000-000000000013'),
('c2000000-0013-0000-0000-000000000005','Tozalash va kimyo','🧹','https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',5,'c1000000-0000-0000-0000-000000000013')
ON CONFLICT (id) DO NOTHING;

-- Bolalar tovarlari subkategoriyalari (5 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0014-0000-0000-000000000001','O''yinchoqlar','🧸','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/j76rr4ei_o%27yinchoqlar.JPG',1,'c1000000-0000-0000-0000-000000000014'),
('c2000000-0014-0000-0000-000000000002','Bolalar aravachalari','🍼','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/ixxnlild_aravachalari.jpg',2,'c1000000-0000-0000-0000-000000000014'),
('c2000000-0014-0000-0000-000000000003','Bolalar mebeli','🛏️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/fahu2ft4_bolalar%20mebeli.jpg',3,'c1000000-0000-0000-0000-000000000014'),
('c2000000-0014-0000-0000-000000000004','Ta''lim va rivojlanish','📚','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',4,'c1000000-0000-0000-0000-000000000014'),
('c2000000-0014-0000-0000-000000000005','Bolalar oziq-ovqati','🍼','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/mcjh82mk_oziq%20ovqat.jpg',5,'c1000000-0000-0000-0000-000000000014')
ON CONFLICT (id) DO NOTHING;

-- Aksessuarlar subkategoriyalari (8 ta)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0015-0000-0000-000000000001','Sumkalar','👜','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',1,'c1000000-0000-0000-0000-000000000015'),
('c2000000-0015-0000-0000-000000000002','Hamyonlar','👛','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',2,'c1000000-0000-0000-0000-000000000015'),
('c2000000-0015-0000-0000-000000000003','Zargarlik va bijuteriya','💍','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',3,'c1000000-0000-0000-0000-000000000015'),
('c2000000-0015-0000-0000-000000000004','Soatlar','⌚','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',4,'c1000000-0000-0000-0000-000000000015'),
('c2000000-0015-0000-0000-000000000005','Ko''zoynak','🕶️','https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',5,'c1000000-0000-0000-0000-000000000015'),
('c2000000-0015-0000-0000-000000000006','Kamarlar','🪢','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',6,'c1000000-0000-0000-0000-000000000015'),
('c2000000-0015-0000-0000-000000000007','Shlyapalar va qalpoqlar','🧢','https://images.unsplash.com/photo-1521369909029-2afed882baaa?w=400',7,'c1000000-0000-0000-0000-000000000015'),
('c2000000-0015-0000-0000-000000000008','Telefon aksessuarlari','📱','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',8,'c1000000-0000-0000-0000-000000000015')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. YANGI ASOSIY KATEGORIYA
-- ============================================================
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c1000000-0000-0000-0000-000000000016','Kitoblar va kanselyariya','📚','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',16,NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3a. YANGI SUB-KATEGORIYALAR (mavjud kategoriyalarga)
-- ============================================================

-- Maishiy texnika — 3 ta yangi (davomi: 8,9,10)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0003-0000-0000-000000000008','Tikuv mashinalari','🧵','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/5h75z0yx_tikuv%20mashinasi.webp',8,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000009','Dazmollar va bug''lagichlar','👔','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/21wm6wuy_dazmol.jpg',9,'c1000000-0000-0000-0000-000000000003'),
('c2000000-0003-0000-0000-000000000010','Go''zallik uchun texnika','💅','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/s5f98cg2_fen.jpg',10,'c1000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Uy-ro'zg'or — 2 ta yangi (davomi: 7,8)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0002-0000-0000-000000000007','To''qimachilik','🧶','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/7diqxoa9_to%27qimachilik.jpg',7,'c1000000-0000-0000-0000-000000000002'),
('c2000000-0002-0000-0000-000000000008','Xo''jalik buyumlari','🏠','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/x4cokmnx_Gemini_Generated_Image_rp1zl2rp1zl2rp1z.png',8,'c1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Mebel — 5 ta yangi (davomi: 14,15,16,17,18)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0001-0000-0000-000000000014','Buyurtma mebel','🛠️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/pcw5o48f_image%20%281%29.webp',14,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000015','Mebel furniturasi','🔩','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/310ylugg_furnitura-kont.jpg',15,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000016','Yashash xonasi','🛋️','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/yuofoz2d_61458-588%402x.jpg',16,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000017','Koridor va dahliz','🚪','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/ezastlhx_f4596c5f1a4b3ddf6b3f7f79e070.webp',17,'c1000000-0000-0000-0000-000000000001'),
('c2000000-0001-0000-0000-000000000018','Oynalar va zerkalo','🪞','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/akbr7hjq_7f9571f4a4877d6c1abbb6e6c3e0.webp',18,'c1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Qurilish va ta'mirlash — 2 ta yangi (davomi: 7,8)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0005-0000-0000-000000000007','Elektr asboblari','🔌','https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400',7,'c1000000-0000-0000-0000-000000000005'),
('c2000000-0005-0000-0000-000000000008','Gul qog''ozlar va elimlar','🎨','https://customer-assets.emergentagent.com/job_abz-download-tool/artifacts/zhkrdmui_gul%20qogozlar.jpg',8,'c1000000-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- Go'zallik va parvarish — 2 ta yangi (davomi: 6,7)
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0012-0000-0000-000000000006','Onalar va chaqaloqlar','🍼','https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',6,'c1000000-0000-0000-0000-000000000012'),
('c2000000-0012-0000-0000-000000000007','Shaxsiy gigiena','🧼','https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',7,'c1000000-0000-0000-0000-000000000012')
ON CONFLICT (id) DO NOTHING;

-- Kitoblar va kanselyariya — 2 ta sub
INSERT INTO categories (id, name, icon, image, sort_order, parent_id) VALUES
('c2000000-0016-0000-0000-000000000001','Kitoblar','📖','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',1,'c1000000-0000-0000-0000-000000000016'),
('c2000000-0016-0000-0000-000000000002','Kanselyariya tovarlari','✏️','https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',2,'c1000000-0000-0000-0000-000000000016')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. BANNERLAR
-- ============================================================
INSERT INTO banners (id,title,subtitle,badge,image,gradient,link,is_active,sort_order) VALUES
('b0000000-0000-0000-0000-000000000001','Yangi mebel kolleksiyasi','Premium sifat, arzon narx — faqat shu oy','YANGI',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=400&fit=crop',
 'from-violet-600 via-purple-600 to-fuchsia-500','/catalog',true,1),
('b0000000-0000-0000-0000-000000000002','Maishiy texnika aksiyasi','Artel, Samsung — 20% chegirma','AKSIYA',
 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=400&fit=crop',
 'from-blue-600 via-cyan-500 to-teal-400','/catalog',true,2),
('b0000000-0000-0000-0000-000000000003','Yotoq to''shaklari — comfort','Yumshoq uyqu uchun hamma narsa','COMFORT',
 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=400&fit=crop',
 'from-rose-500 via-pink-500 to-purple-500','/catalog',true,3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. YETKAZIB BERISH ZONALARI (O'zbekiston)
-- ============================================================
INSERT INTO delivery_zones (region,district,price,is_active) VALUES
('Toshkent shahri',NULL,25000,true),
('Toshkent shahri','Chilonzor',15000,true),
('Toshkent shahri','Yunusabod',20000,true),
('Toshkent shahri','Mirzo Ulug''bek',20000,true),
('Toshkent shahri','Yakkasaroy',18000,true),
('Toshkent shahri','Uchtepa',20000,true),
('Toshkent shahri','Bektemir',22000,true),
('Toshkent shahri','Sergeli',25000,true),
('Toshkent shahri','Shayxontohur',18000,true),
('Toshkent shahri','Olmazor',20000,true),
('Toshkent viloyati',NULL,45000,true),
('Toshkent viloyati','Angren',50000,true),
('Toshkent viloyati','Chinoz',45000,true),
('Toshkent viloyati','Ohangaron',50000,true),
('Toshkent viloyati','Yangiyo''l',40000,true),
('Samarqand viloyati',NULL,80000,true),
('Samarqand viloyati','Samarqand shahri',75000,true),
('Buxoro viloyati',NULL,90000,true),
('Buxoro viloyati','Buxoro shahri',85000,true),
('Andijon viloyati',NULL,85000,true),
('Andijon viloyati','Andijon shahri',80000,true),
('Farg''ona viloyati',NULL,85000,true),
('Farg''ona viloyati','Farg''ona shahri',80000,true),
('Farg''ona viloyati','Qo''qon',85000,true),
('Namangan viloyati',NULL,85000,true),
('Namangan viloyati','Namangan shahri',80000,true),
('Qashqadaryo viloyati',NULL,100000,true),
('Qashqadaryo viloyati','Qarshi',95000,true),
('Surxondaryo viloyati',NULL,110000,true),
('Surxondaryo viloyati','Termiz',105000,true),
('Navoiy viloyati',NULL,95000,true),
('Xorazm viloyati',NULL,120000,true),
('Xorazm viloyati','Urganch',115000,true),
('Jizzax viloyati',NULL,70000,true),
('Sirdaryo viloyati',NULL,50000,true),
('Qoraqalpog''iston Respublikasi',NULL,150000,true),
('Qoraqalpog''iston Respublikasi','Nukus',140000,true);

-- ============================================================
-- 8. OLIB KETISH NUQTALARI
-- ============================================================
INSERT INTO pickup_points (name,address,city,phone,working_hours,is_active) VALUES
('ABZ Mebel Toshkent (Asosiy)','Bunyodkor ko''chasi 12, 1-qavat','Toshkent','+998 71 200-10-10','Du-Sha: 9:00-20:00, Yak: 10:00-18:00',true),
('ABZ Mebel Samarqand','Registon ko''chasi 45','Samarqand','+998 66 235-10-10','Du-Sha: 9:00-19:00',true),
('ABZ Mebel Andijon','Mustaqillik xiyoboni 8','Andijon','+998 74 225-10-10','Du-Sha: 9:00-19:00',true);


-- ============================================================
-- 4. PRODUCT COUNT YANGILASH (mahsulotlar bo'sh)
-- ============================================================
UPDATE categories SET product_count = 0;

SELECT '===== SEED NATIJASI =====' as msg;
SELECT 'Kategoriyalar: ' || count(*) as stats FROM categories;
SELECT 'Mahsulotlar: ' || count(*) as stats FROM products;
SELECT 'Subkategoriyalar: ' || count(*) as stats FROM categories WHERE parent_id IS NOT NULL;
SELECT 'Yetkazib berish zonalari: ' || count(*) as stats FROM delivery_zones;
SELECT 'Bannerlar: ' || count(*) as stats FROM banners;
