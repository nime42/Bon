-- addresses definition

CREATE TABLE addresses (
	id integer PRIMARY KEY AUTOINCREMENT,
	street_name text,
	street_name2 text,
	street_nr text,
	zip_code integer,
	city text
);

CREATE UNIQUE INDEX addresses_u_idx on addresses(
street_name COLLATE NOCASE,
street_name2 COLLATE NOCASE,
street_nr COLLATE NOCASE,
zip_code,city  COLLATE NOCASE);


-- items definition

CREATE TABLE items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT,
	category TEXT,
	cost_price number,
	sellable INTEGER,
	external_id INTEGER
);

CREATE UNIQUE INDEX items_external_id_IDX ON items (external_id);
CREATE UNIQUE INDEX items_name_IDX ON items (name);


-- companies definition

CREATE TABLE companies (
	id integer PRIMARY KEY AUTOINCREMENT,
	name text,
	address_id integer,
	ean_nr text,
	FOREIGN KEY (
			address_id
		)
	REFERENCES addresses (id) ON DELETE set null
					ON UPDATE NO ACTION			
);

CREATE UNIQUE INDEX companies_u_idx on companies(name COLLATE NOCASE);


-- customers definition

CREATE TABLE customers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	forename TEXT,
	surname TEXT,
	email TEXT,
	phone_nr TEXT,
	company_id Integer,
	CONSTRAINT FK_customers_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE set null
);

CREATE UNIQUE INDEX customers_u_idx on customers( 
	email COLLATE NOCASE 

);


-- izettle_products definition

CREATE TABLE izettle_products (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT,
	grocy_item_id,
	quantity integer default 1, connectable INTEGER DEFAULT 1,
	CONSTRAINT FK_izettle_products_items FOREIGN KEY (grocy_item_id) REFERENCES items(id) on delete set null,
	 UNIQUE (name) --UNIQUE (name COLLATE NOCASE)
);


-- salesprice_categories definition

CREATE TABLE salesprice_categories (
	item_id integer,
	price_category text,
	price numeric,
	FOREIGN KEY (
        item_id
    )
	REFERENCES items (id) ON DELETE CASCADE
					ON UPDATE NO ACTION
	
);

CREATE UNIQUE INDEX salesprice_categories_u_idx ON salesprice_categories (item_id,price_category);


-- bons definition

CREATE TABLE bons (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	status TEXT,
	status2 TEXT,
	customer_id INTEGER,
	delivery_date DATETIME,
	delivery_address_id INTEGER,
	nr_of_servings INTEGER,
	customer_info TEXT,
	service_type TEXT,
	payment_type TEXT, kitchen_info TEXT, price_category TEXT, kitchen_selects INTEGER DEFAULT 0 NOT NULL, customer_collects INTEGER DEFAULT 0, 
	CONSTRAINT FK_bons_customers FOREIGN KEY (customer_id) REFERENCES customers(id),
	CONSTRAINT FK_customers_addresses FOREIGN KEY (delivery_address_id) REFERENCES Addresses(id) ON DELETE set null
);


-- izettle_purchases definition

CREATE TABLE izettle_purchases (
	type text NOT NULL CHECK (type IN ('purchase', 'lastPurchaseHash')),
	purchaseUUID TEXT UNIQUE,
	purchase_nr INTEGER,
	userDisplayName TEXT,
	created DATETIME,
	bon_id integer,
	purchase_data TEXT,
	CONSTRAINT FK_izettle_bons FOREIGN KEY (bon_id) REFERENCES bons(id) ON DELETE CASCADE
);


-- orders definition

CREATE TABLE orders (
	bon_id integer,
	item_id integer,
	price numeric,
	quantity integer,
	special_request text,
	sorting_order integer, cost_price NUMERIC, izettle_product_id INTEGER,
	FOREIGN KEY (
        bon_id
    )
	REFERENCES "bons" (id) ON DELETE CASCADE
					ON UPDATE NO ACTION,	
	FOREIGN KEY (
        item_id
    )
	REFERENCES items (id) ON DELETE CASCADE
					ON UPDATE NO ACTION
	
);

-- messages definiton
CREATE TABLE messages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT UNIQUE,
	message TEXT,
	sortorder INTEGER
);