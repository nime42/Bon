CREATE TABLE bon (
	id integer PRIMARY KEY AUTOINCREMENT,
	status text,
	status2 text,
	customer_id integer,
	delivery_date datetime,
	nr_of_servings integer,
	info text,
	payment_type integer,
	service_type text,
	FOREIGN KEY (
        customer_id
    )
    REFERENCES customers (id) ON DELETE NO ACTION
                          ON UPDATE NO ACTION,
	FOREIGN KEY (
        payment_type_id
    )
    REFERENCES payment_types (id) ON DELETE NO ACTION
                          ON UPDATE NO ACTION
	
						  
);

CREATE TABLE customers (
	id integer PRIMARY KEY AUTOINCREMENT,
	forname text,
	surname text,
	company_id integer,
	email text,
	phone_nr text,
	address_id integer,
	FOREIGN KEY (
        company_id
    )
    REFERENCES companies (id) ON DELETE NO ACTION
                          ON UPDATE NO ACTION,
	FOREIGN KEY (
			address_id
		)
	REFERENCES addresses (id) ON DELETE NO ACTION
					ON UPDATE NO ACTION						  
);

CREATE TABLE company (
	id integer PRIMARY KEY AUTOINCREMENT,
	name text,
	address_id integer,
	ean_nr text,
	FOREIGN KEY (
			address_id
		)
	REFERENCES addresses (id) ON DELETE NO ACTION
					ON UPDATE NO ACTION			
);

CREATE TABLE Addresses (
	id integer PRIMARY KEY AUTOINCREMENT,
	street_name text,
	street_name2 text,
	street_nr text,
	zip_code integer,
	city text
);

CREATE TABLE payment_types (
	id integer PRIMARY KEY AUTOINCREMENT,
	name text,
	info text
);

CREATE TABLE items (
	id integer PRIMARY KEY AUTOINCREMENT,
	name text,
	category text,
	cost_price numeric,
	sellable integer
);

CREATE TABLE order (
	bon_id integer,
	item_id integer,
	price numeric,
	quantity integer,
	special_request text,
	sort_order integer,
	FOREIGN KEY (
        bon_id
    )
	REFERENCES bon (id) ON DELETE CASCADE
					ON UPDATE NO ACTION,	
	FOREIGN KEY (
        item_id
    )
	REFERENCES items (id) ON DELETE CASCADE
					ON UPDATE NO ACTION
	
);








