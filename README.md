# NoLocalsAtTemu

Temu’da “Yerel / Local” etiketli ürünleri görmek istemeyenler için küçük, pratik bir Chrome eklentisi. 

## Özellikler

- “Yerel / Local” etiketli ürünleri otomatik filtreler
- **Remove** (kaldır) modu: grid boşluklarını minimuma indirir
- **Hide** (gizle) modu: sadece görünmez yapar
- Aç / kapat anahtarı
- Popup üzerinden kontrol
- Infinite scroll uyumlu (DOM değişimlerini izler)

## Kurulum (Chrome)

1. ZIP’i çıkarın
2. Chrome’da `chrome://extensions` adresine gidin
3. Sağ üstten **Developer mode** (Geliştirici modu) açın
4. **Load unpacked** seçin
5. Çıkardığınız klasörü seçin
6. Temu sayfasını yenileyin (gerekirse `Ctrl + F5`)

## Kullanım

Eklenti simgesine tıklayın:
- **Enable**: Aç/Kapat
- **Remove**: Etiketli ürünleri DOM’dan kaldırır (önerilen)
- **Hide**: Etiketli ürünleri `display:none` ile saklar
- **Scan**: Sayfayı manuel tekrar tarar

## Notlar

- Temu arayüzü sık değiştiği için zamanla selector/heuristic güncellemesi gerekebilir.
- Temuda bulunan yerel satıcı sıklığı yabancı satıcıdan fazla olduğundan, safyada bulunan işte ilandır her neyse sayfa başı az görünebilir.
