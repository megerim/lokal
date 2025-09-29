# Lokal Cafe Web Uygulaması - Geliştirme Yol Haritası (v2)

Bu belge, projenin hem statik hem de simüle edilmiş dinamik analizleri sonucu belirlenen görevleri, hata düzeltmelerini ve gelecek için önerileri içerir. Görevler, projenin "hızlı deploy" felsefesine ve gerçek dünya kullanım senaryolarına uygun olarak önceliklendirilmiştir.

---

## 1. Hızlı Deploy - Kritik Önemli Halledilmesi Gerekenler

Bu bölümdeki görevler, uygulamanın stabil, güvenli, fonksiyonel ve kullanılabilir bir şekilde ilk sürümünün yayınlanması için **tamamlanması mutlak zorunlu olan** maddeleri içerir.

### 1.1. Fonksiyonellik & Güvenlik: Üyelik Talep Sisteminin Entegrasyonu (EN KRİTİK)

- **Sorun:** Proje belgelerinde ve veritabanı şemasında (`membership_requests` tablosu) açıkça belirtilmesine rağmen, mevcut kod bu sistemi tamamen atlayarak kullanıcıların gruplara **doğrudan** katılmasına izin vermektedir. Bu, hem projenin temel bir özelliğinin eksik olması hem de istemciden doğrudan veritabanına yazma işlemi yapıldığı için ciddi bir güvenlik açığıdır.
- **Çözüm Önerisi:**
    1.  **Mevcut Doğrudan Katılma Mantığını Kaldır:** `SocialGroupCard.tsx` içerisindeki `handleJoinGroup` fonksiyonu tamamen kaldırılmalı veya yeniden düzenlenmelidir.
    2.  **API Endpoint'leri Oluştur:**
        -   `POST /api/groups/[groupId]/request-membership`: Gruba katılma isteği gönderen bir API rotası oluşturulmalı.
        -   `POST /api/admin/membership-requests`: Adminin bir talebi onaylaması (`approve`) veya reddetmesi (`reject`) için bir API rotası oluşturulmalı.
    3.  **Frontend Arayüzünü Güncelle:**
        -   "Katıl" butonu, "Katılma Talebi Gönder" olarak değiştirilmeli ve bu butona tıklandığında yeni API endpoint'ini çağıran bir diyalog (örn: `MembershipRequestDialog`) açılmalıdır.
        -   Admin panelinde, bekleyen üyelik taleplerini listeleyen ve yöneticinin bunları onaylayıp/reddedebileceği bir arayüz (`/admin/membership-requests`) oluşturulmalıdır.
- **Test Senaryosu (Delege Edilecek Prompt):**
    > Jules, lütfen "Üyelik Talep Sistemi"ni entegre et:
    > 1.  `SocialGroupCard.tsx`'deki `handleJoinGroup` fonksiyonunu, `membership_requests` tablosuna yeni bir "pending" kayıt oluşturan bir API çağrısıyla değiştir.
    > 2.  `/admin` altında, bekleyen talepleri listeleyen, "Onayla" ve "Reddet" butonları içeren bir sayfa oluştur.
    > 3.  Onaylama işlemi, `membership_requests` tablosundaki durumu güncellemeli ve `group_members` tablosuna yeni bir kayıt eklemelidir. Bu işlemler transaction içinde yapılmalıdır.

### 1.2. Güvenlik: Admin Rolü Atama Mekanizması Eksikliği

- **Sorun:** Bir kullanıcıyı 'admin' olarak atamak için standart ve güvenli bir mekanizma bulunmuyor. Bu durum, veritabanına manuel müdahale gerektiriyor.
- **Çözüm Önerisi:**
    1.  **Güvenli API Endpoint'i Oluşturma:** Sadece mevcut adminlerin kullanabileceği bir API endpoint'i (`/api/admin/set-user-role`) oluşturulmalı.
    2.  **Admin Paneli Arayüzü:** Admin panelinde, kullanıcıları listeleyen ve rollerini değiştirmeye yarayan bir arayüz eklenmeli.
- **Test Senaryosu (Delege Edilecek Prompt):**
    > Jules, `app/api/admin/set-user-role/route.ts` adında, sadece adminlerin erişebileceği ve bir kullanıcının rolünü güncelleyebileceği bir API rotası oluştur. Ardından bu API'yi kullanan bir admin arayüzü tasarla.

### 1.3. Fonksiyonellik: Doğum Günü Kuponu Cron Job Kurulumu

- **Sorun:** `generate_birthday_vouchers()` fonksiyonunu otomatik tetikleyecek bir mekanizma eksik.
- **Çözüm Önerisi:** Supabase'in "Scheduled Functions" özelliği kullanılarak her gün çalışacak bir cron job tanımlanmalı.
- **Yapılacaklar:** Supabase Dashboard üzerinden `0 0 * * *` zamanlamasıyla `SELECT generate_birthday_vouchers();` komutunu çalıştıran bir cron job oluşturulmalı.

---

## 2. Backend Önerileri

### 2.1. Performans & Ölçeklenebilirlik: Grup Listeleme ve Filtrelemenin Sunucu Tarafına Taşınması

- **Sorun:** Sosyal gruplar sayfasında, **tüm** aktif gruplar veritabanından çekilip filtreleme (arama, kategori, gün) istemci tarafında yapılıyor. Grup sayısı arttıkça bu durum sayfa yükünü aşırı yavaşlatacak ve kötü bir kullanıcı deneyimine yol açacaktır.
- **Çözüm Önerisi:**
    1.  **Sunucu Bileşenine Dönüştürme:** `SocialGroupsGrid.tsx` bileşeni, bir sunucu bileşenine (`async function`) dönüştürülmeli.
    2.  **Dinamik Sorgu Oluşturma:** Filtreleme parametreleri (arama terimi, kategori vb.) URL arama parametreleri (`URLSearchParams`) üzerinden alınmalı ve bu parametrelere göre dinamik bir Supabase sorgusu oluşturulmalıdır. Sorgu, `.ilike()`, `.eq()` gibi Supabase filtrelerini kullanarak sadece ilgili veriyi çekmelidir.
    3.  **Verimsizliği Ortadan Kaldırma:** Bu sayede, veritabanından sadece kullanıcının görmek istediği veriler çekilir, bu da hem ilk yükleme süresini kısaltır hem de ölçeklenebilirliği artırır.

### 2.2. Veri Bütünlüğü: `group_members` Tablosunun Normalleştirilmesi

- **Sorun:** `group_members` tablosu, `user_profiles` tablosunda zaten mevcut olan `user_name` ve `user_email` bilgilerini gereksiz yere kopyalamaktadır. Bu, veri tekrarına yol açar ve veri tutarsızlığına neden olabilir.
- **Çözüm Önerisi:**
    1.  **Veritabanı Şemasını Güncelle:** `group_members` tablosundan `user_name` ve `user_email` sütunları kaldırılmalı. Tabloda sadece `group_id` ve `user_id` kalmalıdır.
    2.  **Kodu Güncelle:** Uygulama içinde kullanıcı adı gibi bilgilere ihtiyaç duyulduğunda, `group_members` ve `user_profiles` tabloları arasında `JOIN` sorgusu yapılmalıdır.

### 2.3. Veri Bütünlüğü: `activities` Tablosunun İki Kez Tanımlanması

- **Sorun:** `activities` tablosu hem `01_base_tables.sql` hem de `05_enhancements.sql` dosyalarında tanımlanmış.
- **Çözüm Önerisi:** `01_base_tables.sql` dosyasındaki `activities` tanımı ve ilgili RLS politikaları tamamen kaldırılmalıdır.

---

## 3. Frontend ve Dizayn Önerileri

### 3.1. UX Tutarlılığı: Onay Diyaloglarının Modernleştirilmesi

- **Sorun:** Gruptan ayrılma gibi kritik işlemler için tarayıcının standart `confirm()` diyaloğu kullanılıyor. Bu, projenin modern tasarım diliyle (shadcn/ui) uyumsuzdur.
- **Çözüm Önerisi:** `confirm()` diyaloğu, projenin tasarım sistemine uygun, şık bir `<AlertDialog>` bileşeni ile değiştirilmelidir. Bu, kullanıcıya daha tutarlı ve profesyonel bir deneyim sunar.

### 3.2. UX İyileştirmesi: Gerçek Zamanlı Bildirim Sistemi

- **Sorun:** Kullanıcı arayüzünde gerçek zamanlı bir bildirim sistemi (yeni kupon, üyelik onayı vb. için) bulunmuyor.
- **Çözüm Önerisi:** Veritabanında bir `notifications` tablosu oluşturulmalı ve Supabase Realtime kullanılarak kullanıcıya anlık bildirimler gösteren bir UI bileşeni (çan ikonu vb.) eklenmelidir.

---

## 4. DevOps ve Dokümantasyon

### 4.1. Geliştirici Deneyimi (DX): Sağlam Başlangıç (Robust Bootstrap) Süreci

- **Sorun:** Projenin başlangıç süreci kırılgandır. `.env.local` dosyası eksik olduğunda uygulama sessizce çökmekte ve port çakışmaları geliştiricinin zamanını almaktadır.
- **Çözüm Önerisi:**
    1.  **Ortam Değişkeni Doğrulaması:** Uygulama başlangıcında, gerekli tüm ortam değişkenlerinin mevcut olup olmadığını kontrol eden bir mekanizma eklenmeli. Eksik değişkenler varsa, uygulama çökmemeli, bunun yerine hangi değişkenlerin eksik olduğunu belirten açıklayıcı bir hata mesajı vermelidir.
    2.  **Port Temizleme Script'i:** `package.json` dosyasına, geliştirme ortamında sıkışmış sunucu işlemlerini temizleyen, platformdan bağımsız (cross-platform) bir script (`pnpm kill-port` gibi) eklenmelidir.

### 4.2. Geliştirme Süreci: Test Ortamı ve Seed Verisi

- **Sorun:** Geliştirme ve test süreçlerini hızlandırmak için, veritabanını hızlıca bilinen bir duruma getirecek "seed" verisine ihtiyaç var.
- **Çözüm Önerisi:** Birkaç test kullanıcısı, grup, aktivite vb. oluşturan bir `database/seed.sql` script'i hazırlanmalı ve `README.md`'ye çalıştırma talimatları eklenmelidir.

### 4.3. Dokümantasyon: Veritabanı Şeması Görselleştirmesi

- **Sorun:** Veritabanı şemasını anlamak için tüm SQL dosyalarını okumak gerekiyor.
- **Çözüm Önerisi:** dbdiagram.io gibi bir araçla şema görselleştirilmeli ve diyagram projeye eklenmelidir.
