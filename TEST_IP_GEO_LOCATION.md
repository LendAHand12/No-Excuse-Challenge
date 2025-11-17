# Hướng dẫn Test IP Geolocation

## Cách 1: Sử dụng Test Mode (Development)

### Test với query parameter trong URL:

1. **Test như user ở Việt Nam:**
   ```
   http://localhost:3000/signup?ref=xxx&receiveId=yyy&testCountry=VN
   ```

2. **Test như user ở nước ngoài (ví dụ: US):**
   ```
   http://localhost:3000/signup?ref=xxx&receiveId=yyy&testCountry=US
   ```

3. **Test như user ở nước ngoài (ví dụ: UK):**
   ```
   http://localhost:3000/signup?ref=xxx&receiveId=yyy&testCountry=GB
   ```

**Lưu ý:** Test mode chỉ hoạt động khi `NODE_ENV !== 'production'`

## Cách 2: Sử dụng VPN

### VPN Miễn phí:
1. **ProtonVPN** - https://protonvpn.com/
   - Có free tier
   - Chọn server ở nước ngoài (US, UK, etc.)

2. **Windscribe** - https://windscribe.com/
   - 10GB free mỗi tháng
   - Nhiều server locations

3. **TunnelBear** - https://www.tunnelbear.com/
   - 500MB free mỗi tháng
   - Dễ sử dụng

### VPN Trả phí (tốt hơn):
- **NordVPN** - https://nordvpn.com/
- **ExpressVPN** - https://www.expressvpn.com/
- **Surfshark** - https://surfshark.com/

## Cách 3: Sử dụng Browser Extensions

1. **Location Guard** (Chrome/Firefox)
   - Fake browser geolocation
   - Có thể không ảnh hưởng đến IP-based detection

2. **VPN Extensions:**
   - Hola VPN
   - Touch VPN
   - SetupVPN

## Cách 4: Sử dụng Proxy

1. **Online Proxy Services:**
   - https://www.proxy-site.com/
   - https://www.hidemyass.com/
   - Nhập URL và chọn country

2. **Proxy Lists:**
   - https://www.proxy-list.download/
   - Cấu hình proxy trong browser settings

## Cách 5: Sử dụng Mobile Hotspot

1. Sử dụng mobile data với VPN
2. Hoặc sử dụng mobile hotspot từ thiết bị khác ở nước ngoài

## Cách 6: Sử dụng Cloud Services

1. **AWS/GCP/Azure:**
   - Tạo VM ở region khác (ví dụ: us-east-1)
   - Remote desktop vào VM và test từ đó

## Kiểm tra IP hiện tại:

Sau khi kết nối VPN/Proxy, kiểm tra IP tại:
- https://whatismyipaddress.com/
- https://www.iplocation.net/
- https://ip-api.com/

## Test Checklist:

- [ ] Test với IP Việt Nam → Bank fields hiển thị và required
- [ ] Test với IP nước ngoài → Bank fields ẩn, wallet required
- [ ] Test với testCountry=VN query param
- [ ] Test với testCountry=US query param
- [ ] Verify backend lưu đúng IP và country code

