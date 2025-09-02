-- Cập nhật quantity cho các sản phẩm có giá trị NULL
UPDATE product SET quantity = 1 WHERE quantity IS NULL;

-- Kiểm tra kết quả
SELECT id, name, quantity FROM product WHERE quantity IS NULL;

-- Hiển thị tất cả sản phẩm để kiểm tra
SELECT id, name, quantity FROM product ORDER BY id;
