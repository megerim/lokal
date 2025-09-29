# Lokal Cafe Web Uygulaması - Geliştirme Yol Haritası

Bu belge, projenin mevcut durumunu analiz ederek belirlenen görevleri, hata düzeltmelerini ve gelecek için önerileri içerir. Görevler, projenin "hızlı deploy" felsefesine uygun olarak önceliklendirilmiştir. Her görev, sorunu, çözüm önerisini ve potansiyel test adımlarını detaylı bir şekilde açıklamaktadır.

---

## 1. Hızlı Deploy - Kritik Önemli Halledilmesi Gerekenler

Bu bölümdeki görevler, uygulamanin stabil, güvenli ve kullanilabilir bir şekilde ilk sürümünün yayinlanmasi için tamamlanmasi zorunlu olan maddeleri içerir.

### 1.1. Güvenlik: Admin Rolü Atama Mekanizması Eksikliği

- **Sorun:** Mevcut sistemde `user_profiles` tablosunda bir `role` sütunu ('admin', 'member') bulunuyor. Ancak, bir kullanıcıyı 'admin' olarak atamak için standart ve güvenli bir mekanizma (API endpoint, admin paneli arayüzü vb.) bulunmuyor. Bu durum, şu anda veritabanına manuel müdahale gerektiriyor ki bu hem güvensiz hem de sürdürülebilir değil.
- **Çözüm Önerisi:**
    1.  **Güvenli API Endpoint'i Oluşturma:** Sadece mevcut adminlerin kullanabileceği bir API endpoint'i (`/api/admin/set-user-role`) oluşturulmalı. Bu endpoint, `target_user_id` ve `new_role` gibi parametreler almalıdır.
    2.  **RLS Politikası Güncellemesi:** Bu endpoint'in arkasındaki Supabase Edge Function veya sunucu tarafı kod, işlemi yapan kullanıcının 'admin' rolüne sahip olup olmadığını kontrol etmelidir.
    3.  **Admin Paneli Arayüzü:** Admin panelinde, kullanıcıları listeleyen ve yanlarında rolünü değiştirmeye yarayan bir arayüz (örneğin bir dropdown menü) eklenmeli. Bu arayüz, yukarıda bahsedilen güvenli API endpoint'ini çağırmalıdır.
- **Test Senaryosu (Delege Edilecek Prompt):**
    > Jules, lütfen aşağıdaki görevi gerçekleştir:
    > 1.  `app/api/admin/set-user-role/route.ts` adında yeni bir API rotası oluştur.
    > 2.  Bu rota, `POST` metodu ile `targetUserId` ve `role` ('admin' veya 'member') parametrelerini alsın.
    > 3.  İsteği yapan kullanıcının `user_profiles` tablosunda 'admin' rolüne sahip olup olmadığını kontrol et. Yetkisi yoksa 403 (Forbidden) hatası döndür.
    > 4.  Yetkisi varsa, `targetUserId`'ye sahip kullanıcının rolünü veritabanında güncelle.
    > 5.  `app/admin/users/page.tsx` gibi bir sayfada, tüm kullanıcıları listeleyen ve rollerini değiştirmeye olanak tanıyan bir arayüz oluştur. Bu arayüz, oluşturduğun API'yi kullansın.

### 1.2. Fonksiyonellik: Doğum Günü Kuponlarının Otomatik Üretimi İçin Zamanlanmış Görev (Cron Job) Kurulumu

- **Sorun:** `05_enhancements.sql` dosyasında `generate_birthday_vouchers()` adında bir PostgreSQL fonksiyonu tanımlanmış. Bu fonksiyonu her gün otomatik olarak tetikleyecek bir mekanizma (cron job) kurulumu eksik. Bu olmadan, kuponlar otomatik olarak üretilmeyecektir.
- **Çözüm Önerisi:**
    1.  **Supabase Cron Jobs Kullanımı:** Supabase'in sunduğu `pg_cron` eklentisi veya "Scheduled Functions" özelliği kullanılmalı.
    2.  **Zamanlama Kurulumu:** Her gün gece yarısı (örneğin, `0 0 * * *` cron ifadesiyle) `generate_birthday_vouchers()` fonksiyonunu çağıran bir cron job tanımlanmalı.
    3.  **SQL Komutu:** Cron job'un çalıştıracağı komut `SELECT generate_birthday_vouchers();` olmalıdır.
- **Yapılacaklar:**
    - Supabase Dashboard üzerinden "Database" -> "Cron Jobs" bölümüne gidilir.
    - "New Job" denilerek yeni bir zamanlanmış görev oluşturulur.
    - İsim: `Daily Birthday Voucher Generation`.
    - Cron Expression: `0 0 * * *` (Her gün gece yarısı UTC).
    - SQL: `SELECT generate_birthday_vouchers();`
    - Bu kurulumun yapıldığına dair `README.md` dosyasına bir not eklenmelidir.

### 1.3. Veri Bütünlüğü: `activities` Tablosunun İki Kez Tanımlanması

- **Sorun:** Hem `01_base_tables.sql` hem de `05_enhancements.sql` dosyalarında `CREATE TABLE IF NOT EXISTS public.activities` ifadesi bulunuyor. Bu durum, şemaların ayrı ayrı çalıştırılması durumunda bir hataya yol açmasa da, kod tekrarına ve kafa karışıklığına neden oluyor.
- **Çözüm Önerisi:**
    1.  `01_base_tables.sql` dosyasındaki `activities` tablosu tanımı ve ilgili RLS politikaları tamamen kaldırılmalıdır.
    2.  Tablonun tek ve doğru tanımı `05_enhancements.sql` dosyasında bırakılmalıdır.
- **Test Senaryosu (Delege Edilecek Prompt):**
    > Jules, `database/schemas/01_base_tables.sql` dosyasını aç ve `CREATE TABLE IF NOT EXISTS public.activities` ile başlayan bölümü ve bu tabloya ait tüm RLS politikalarını sil.

---

## 2. Backend Önerileri

Bu bölüm, uygulamanın performansını, güvenliğini ve ölçeklenebilirliğini artıracak backend odaklı iyileştirmeleri içerir.

### 2.1. Optimizasyon: Veritabanı Fonksiyonlarının Güvenlik ve Performans İyileştirmesi

- **Sorun:** `check_loyalty_voucher` ve `generate_birthday_vouchers` gibi fonksiyonlar büyük tablolar üzerinde sorgular çalıştırabilir ve kullanıcı sayısı arttıkça yavaşlayabilir.
- **Çözüm Önerisi:**
    1.  **`generate_birthday_vouchers` Optimizasyonu:** Fonksiyonun `SECURITY DEFINER` olarak çalıştırılması, RLS politikalarını bypass ederek daha performanslı çalışmasını sağlayabilir. Bu dikkatli bir şekilde, fonksiyonun içindeki sorguların güvenli olduğu doğrulandıktan sonra yapılmalıdır.
    2.  **`generate_voucher_code` İyileştirmesi:** Mevcut fonksiyon basit bir rastgele karakter üretecidir. Çakışma ihtimalini ortadan kaldırmak için `LOKAL-` ön eki ile birlikte `gen_random_uuid()`'nin bir parçasını kullanacak şekilde güncellenmelidir.
- **Yapılacaklar:**
    - `generate_voucher_code` fonksiyonunu `gen_random_uuid()` kullanacak şekilde güncelle.
    - `generate_birthday_vouchers` fonksiyonunu `SECURITY DEFINER` olarak tanımla.

### 2.2. Güvenlik: RLS Politikalarının Detaylandırılması

- **Sorun:** Bazı RLS politikaları (örn: `Club comments are viewable by everyone`) çok genel ve beklenen gizliliği sağlamıyor olabilir. Kulübe özel duyuruların ve yorumların sadece üyeler tarafından görülmesi gerekir.
- **Çözüm Önerisi:**
    1.  **Grup Yorumları İçin RLS:** `club_comments` için `SELECT` politikasını, sadece grup üyelerinin yorumları görebileceği şekilde güncelle.
    2.  **Duyurular İçin RLS:** `duyurular` tablosunun `SELECT` politikasını, `is_club_only` alanına göre dinamik hale getir. Herkese açık duyurular herkes tarafından, kulübe özel olanlar ise sadece o kulübün üyeleri tarafından görülebilmelidir.
- **Test Senaryosu (Delege Edilecek Prompt):**
    > Jules, `05_enhancements.sql` dosyasındaki RLS politikalarını güncelle:
    > 1. `club_comments` tablosunun `SELECT` politikasını, sadece ilgili grubun üyelerinin yorumları görebileceği şekilde değiştir.
    > 2. `duyurular` tablosunun `SELECT` politikasını, `is_club_only` alanı `true` ise sadece ilgili grup üyelerinin görebileceği, `false` ise herkesin görebileceği şekilde düzenle.

---

## 3. Frontend ve Dizayn Önerileri

Bu bölüm, kullanıcı deneyimini (UX) ve arayüz tasarımını (UI) iyileştirmeye yönelik önerileri içerir.

### 3.1. UX İyileştirmesi: Gerçek Zamanlı Bildirim Sistemi

- **Sorun:** Kullanıcı arayüzünde (örneğin bir çan ikonu ile) gerçek zamanlı bir bildirim sistemi bulunmuyor. Bir kullanıcının grup üyeliği onaylandığında veya yeni bir kupon kazandığında anında haberdar olması gerekir.
- **Çözüm Önerisi:**
    1.  **`notifications` Tablosu Oluşturma:** Veritabanında `user_id`, `message`, `link`, `is_read` gibi sütunlar içeren bir `notifications` tablosu oluştur.
    2.  **Supabase Realtime Kullanımı:** Kullanıcı giriş yaptığında, bu `notifications` tablosuna kendi `user_id`'si ile abone ol.
    3.  **Tetikleyiciler ile Bildirim Oluşturma:** Üyelik onayı, yeni kupon gibi olaylar gerçekleştiğinde bu `notifications` tablosuna yeni bir kayıt ekleyen mekanizmalar kur.
    4.  **UI Entegrasyonu:** Arayüzde, okunmamış bildirim sayısını gösteren bir çan ikonu ve bildirimleri listeleyen bir panel ekle.

### 3.2. UI İyileştirmesi: Admin Panelinin Geliştirilmesi

- **Sorun:** Admin paneli, tüm yönetimsel görevler için merkezi ve kullanıcı dostu bir arayüz sunmuyor olabilir.
- **Çözüm Önerisi:**
    1.  **Merkezi Dashboard:** `/admin` ana sayfasında, son talepler ve doğum günleri gibi önemli metrikleri gösteren bir "snapshot" dashboard'u oluştur.
    2.  **Ayrı Yönetim Sayfaları:** Sol menüde "Kullanıcılar", "Gruplar", "Aktiviteler", "Kuponlar" gibi net ve ayrı yönetim sayfaları oluştur.
    3.  **Arama ve Filtreleme:** Her yönetim sayfasında (örneğin, kullanıcılar listesi) arama ve filtreleme özellikleri ekle.

---

## 4. DevOps ve Dokümantasyon

Bu bölüm, projenin geliştirme, test ve dağıtım süreçlerini iyileştirmeye yönelik görevleri içerir.

### 4.1. Dokümantasyon: Veritabanı Şeması Görselleştirmesi

- **Sorun:** Veritabanı şemasını anlamak için tüm SQL dosyalarını tek tek okumak gerekiyor. Görsel bir diyagram, şemayı anlamayı kolaylaştıracaktır.
- **Çözüm Önerisi:**
    1.  **Araç Seçimi:** dbdiagram.io veya Supabase'in kendi şema görselleştirme aracı kullanılabilir.
    2.  **Diyagram Oluşturma:** Tüm tablolar ve aralarındaki ilişkiler görselleştirilmeli.
    3.  **Projeye Ekleme:** Oluşturulan diyagramın bir ekran görüntüsü `README.md`'nin sonuna veya ayrı bir `DATABASE.md` dosyasına eklenmelidir.

### 4.2. Geliştirme Süreci: Test Ortamı ve Seed Verisi

- **Sorun:** Geliştirme ve test süreçlerini hızlandırmak için, veritabanını hızlıca bilinen bir duruma getirecek "seed" verisine ihtiyaç var.
- **Çözüm Önerisi:**
    1.  **Seed Script'i Oluşturma:** Projenin kök dizininde `database/seed.sql` adında bir script oluşturulmalı.
    2.  **Örnek Veri:** Bu script, birkaç test kullanıcısı (admin ve normal üye), sosyal gruplar, sahte aktiviteler ve duyurular oluşturmalıdır.
    3.  **Çalıştırma Talimatları:** `README.md` dosyasına, bu seed script'inin nasıl çalıştırılacağına dair talimatlar (`pnpm db:seed` gibi) eklenmelidir.
