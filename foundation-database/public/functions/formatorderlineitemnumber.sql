CREATE OR REPLACE FUNCTION formatOrderLineItemNumber(pOrderType TEXT,
                                                     pOrderItemId INTEGER)
RETURNS TEXT AS $$
-- Copyright (c) 1999-2017 by OpenMFG LLC, d/b/a xTuple. 
-- See www.xtuple.com/CPAL for the full text of the software license.
DECLARE
  _formatted TEXT := '';
BEGIN

  IF (pOrderType = 'SO') THEN
    _formatted := formatSoItemNumber(pOrderItemId);
  
  ELSIF (pOrderType = 'PO') THEN
    _formatted := formatPoItemNumber(pOrderItemId);
  
  ELSIF (pOrderType = 'TO') THEN
    _formatted := formatToNumber(pOrderItemId);
  
  ELSIF (pOrderType = 'WO') THEN
    _formatted := formatWoNumber(pOrderItemId, 'wo');
  
  ELSIF (pOrderType = 'RA') THEN
    SELECT (rahead_number::TEXT || '-' || formatralinenumber(raitem_id)) INTO _formatted
    FROM rahead, raitem
    WHERE raitem_rahead_id=rahead_id
      AND raitem_id=pOrderItemId; 
  
  ELSIF (pOrderType = 'IN') THEN
    SELECT (invchead_invcnumber::TEXT || '-' || invcitem_linenumber) INTO _formatted
    FROM invcitem
      JOIN invchead ON invcitem_invchead_id = invchead_id
    WHERE invcitem_id=pOrderItemId;
  END IF;

  RETURN _formatted;

END;
$$ LANGUAGE plpgsql;
