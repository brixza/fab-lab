-- Add description and scent_family columns to products
alter table products
  add column if not exists description text,
  add column if not exists scent_family text;

-- Seed St. Vetyver
update products set
  description  = 'St. Vetyver är en klassiskt uppbyggd cologne med karibisk känsla, där vetiver är stommen. Den börjar friskt med bitterapelsin och rosépeppar, med en saltgrön ton av sjögräs. Sedan kommer sockerrör och kryddnejlikblad in och ger värme, och i basen ligger haitisk vetiver tillsammans med rom som gör avslutet torrt, vuxet och långlivat. En bra vardagsdoft när du vill dofta fräscht, men inte sportigt.',
  scent_family = 'Aromatisk träig (vetiver)'
where sku = 'st-vetyver-d-s-durga';
