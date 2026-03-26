insert into sellers (id, seller_type, name, phone, address, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'dealer', 'Singh Car Bazar', '+91 7277131313', 'B.M.C. Chowk, Shop No. 3-4, Near Desh Bhagat Hall, 10 G.T. Road, Jalandhar', 'Demo showroom seller'),
  ('22222222-2222-2222-2222-222222222222', 'private', 'Karan Singh', '+91 9876543210', null, 'Demo private seller')
on conflict (id) do nothing;

insert into listings (
  id,
  seller_id,
  slug,
  stock_number,
  number_plate,
  make,
  model,
  variant,
  year,
  registration_year,
  fuel,
  transmission,
  km_driven,
  color,
  owner_number,
  price,
  location,
  description,
  featured,
  status,
  is_published,
  seller_type
)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'mahindra-thar-2022-scb-101', 'SCB-101', 'PB08-TH-2022', 'Mahindra', 'Thar', 'LX Hard Top Diesel MT', 2022, 2022, 'Diesel', 'Manual', 24000, 'Black', 1, 1645000, 'Jalandhar', 'Well-maintained Mahindra Thar with clean paperwork and showroom-ready presentation.', true, 'available', true, 'dealer'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'hyundai-creta-2021-scb-102', 'SCB-102', 'PB08-CR-2021', 'Hyundai', 'Creta', 'SX IVT Petrol', 2021, 2021, 'Petrol', 'Automatic', 31500, 'White', 1, 1490000, 'Jalandhar', 'Popular family SUV with automatic transmission and strong condition.', true, 'available', true, 'dealer'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'honda-city-2020-scb-103', 'SCB-103', 'PB08-CT-2020', 'Honda', 'City', 'VX CVT', 2020, 2020, 'Petrol', 'Automatic', 41000, 'Silver', 2, 1145000, 'Jalandhar', 'Clean sedan with smooth automatic drive and updated service history.', false, 'booked', true, 'private')
on conflict (id) do nothing;

insert into inquiries (listing_id, name, phone, email, message, car_title)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Harsh Gupta', '+91 9988776655', 'harsh@example.com', 'Need more photos and best price for the Thar.', 'Mahindra Thar 2022'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Simran Arora', '+91 8877665544', 'simran@example.com', 'Please share finance options for the Creta.', 'Hyundai Creta 2021');
