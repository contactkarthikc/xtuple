﻿-- Add column
select xt.add_column('shiphead','shiphead_dropship','BOOLEAN','NOT NULL DEFAULT FALSE','public','indicates whether generated by drop-shipment');