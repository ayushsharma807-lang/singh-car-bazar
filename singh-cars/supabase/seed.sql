insert into public.listings (
  id,
  stock_number,
  number_plate,
  make,
  model,
  variant,
  year,
  fuel,
  transmission,
  km_driven,
  color,
  owner_count,
  price,
  location,
  description,
  seller_type,
  status,
  featured,
  cover_image_url
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'SCB-101',
    'PB08-TH-2022',
    'Mahindra',
    'Thar',
    'LX Hard Top Diesel MT',
    2022,
    'Diesel',
    'Manual',
    24000,
    'Black',
    1,
    1645000,
    'Jalandhar',
    'Well-maintained Mahindra Thar with clean paperwork and showroom-ready condition.',
    'dealer',
    'available',
    true,
    'https://placehold.co/1200x800/png?text=Mahindra+Thar'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'SCB-102',
    'PB08-CR-2021',
    'Hyundai',
    'Creta',
    'SX IVT Petrol',
    2021,
    'Petrol',
    'Automatic',
    31500,
    'White',
    1,
    1490000,
    'Jalandhar',
    'Popular family SUV with automatic transmission and strong condition.',
    'dealer',
    'available',
    true,
    'https://placehold.co/1200x800/png?text=Hyundai+Creta'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'SCB-103',
    'PB08-CT-2020',
    'Honda',
    'City',
    'VX CVT',
    2020,
    'Petrol',
    'Automatic',
    41000,
    'Silver',
    2,
    1145000,
    'Jalandhar',
    'Clean sedan with smooth automatic drive and updated service history.',
    'private',
    'booked',
    false,
    'https://placehold.co/1200x800/png?text=Honda+City'
  )
on conflict (id) do nothing;

insert into public.listing_images (listing_id, image_url, sort_order)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://placehold.co/1200x800/png?text=Mahindra+Thar', 0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://placehold.co/1200x800/png?text=Hyundai+Creta', 0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://placehold.co/1200x800/png?text=Honda+City', 0);

insert into public.sellers (listing_id, name, phone, address, notes, seller_type)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Singh Car Bazar',
    '+91 7277131313',
    'B.M.C. Chowk, Shop No. 3-4, Near Desh Bhagat Hall, 10 G.T. Road, Jalandhar',
    'Demo showroom seller',
    'dealer'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Singh Car Bazar',
    '+91 7277131313',
    'B.M.C. Chowk, Shop No. 3-4, Near Desh Bhagat Hall, 10 G.T. Road, Jalandhar',
    'Demo showroom seller',
    'dealer'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Karan Singh',
    '+91 9876543210',
    null,
    'Demo private seller',
    'private'
  )
on conflict (listing_id) do nothing;

insert into public.inquiries (listing_id, name, phone, email, message)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Harsh Gupta',
    '+91 9988776655',
    'harsh@example.com',
    'Need more photos and best price for the Thar.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Simran Arora',
    '+91 8877665544',
    'simran@example.com',
    'Please share finance options for the Creta.'
  );
