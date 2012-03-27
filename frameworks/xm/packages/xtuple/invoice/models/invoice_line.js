// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

sc_require('mixins/_invoice_line');

/**
  @class

  @extends XM.Record
*/
XM.InvoiceLine = XM.Record.extend(XM._InvoiceLine,
  /** @scope XM.InvoiceLine.prototype */ {
  
  /**
    An XM.Unit array of valid
  */
  sellingUnits: [],
  
  tax: 0,
  
  /** @private */
  taxesLength: 0,
  
  /** @private */
  taxesLengthBinding: SC.Binding.from('*taxes.length').noDelay(), 
  
  taxDetail: [],
  
  /** private */
  taxDetailLength: 0,
  
  /** private */
  taxDetailLengthBinding: SC.Binding.from('*taxDetail.length').noDelay(),
  
  // .................................................
  // CALCULATED PROPERTIES
  //

  extendedPrice: function() {
    var billed = this.get('billed') || 0,
        qtyUnitRatio = this.get('quantityUnitRatio') || 1,
        price = this.get('price') || 0,
        priceUnitRatio = this.get('priceUnitRatio') || 1;
    return SC.Math.round(billed * qtyUnitRatio * (price / priceUnitRatio), XM.MONEY_SCALE);
  }.property('billed', 'price').cacheable(),

  //..................................................
  // METHODS
  //

  updateSellingUnits: function() {
    var that = this,
        item = that.get('item');
    if(item) {
  
      // callback
      callback = function(err, result) {
        var units = [], qry,
            store = that.get('store');
        qry = SC.Query.local(XM.Unit, {
          conditions: "guid ANY {units}",
          parameters: { 
            units: result.units
          }
        });
        units = store.find(qry);
        that.setIfChanged('sellingUnits', units);
      }
      
      // function call 
      XM.Item.sellingUnits(item, callback);
    } else that.setIfChanged('sellingUnits', []);
  },

  //..................................................
  // OBSERVERS
  //

  extendendPriceDidChange: function() {
    var invoice = this.get('invoice');
    if (invoice) invoice.updateSubTotal();
  }.observes('extendedPrice'),
  
  taxDidChange: function() {
    var invoice = this.get('invoice');
    if (invoice) invoice.updateLineTax();
  }.observes('tax'),

  itemDidChange: function() {
    this.updateSellingUnits();
  }.observes('item'),

  statusDidChange: function() {
    var status = this.get('status');
    if(this.get('status') === SC.Record.READY_CLEAN) {
      this.item.set('isEditable', false);
      this.updateSellingUnits();
      this.taxCriteriaDidChange();
    }
  }.observes('status'),

  priceCriteriaDidChange: function() {
    // only update in legitimate editing states
    var status = this.get('status');    
    if(status !== SC.Record.READY_NEW && 
       status !== SC.Record.READY_DIRTY) return;
       
    var that = this,
        customer = this.getPath('invoice.customer'),
        shipto = this.getPath('invoice.shipto'),
        item = this.get('item'),
        quantity = this.get('billed'),
        quantityUnit = this.get('quantityUnit'),
        priceUnit = this.get('priceUnit'),
        currency = this.getPath('invoice.currency'),
        effective = this.getPath('invoice.invoiceDate'),
        status = this.get('status');

    // if we have everything we need, get a price from the data source
    if (customer && item && quantity &&
        quantityUnit && priceUnit && currency && effective) {
   
      // callback
      callback = function(err, result) {
        that.setIfChanged('price', result);
        that.setIfChanged('customerPrice', result);
      }
     
      // function call
      XM.Customer.price(customer, shipto, item, quantity, quantityUnit, priceUnit, currency, effective, callback);
    }
  }.observes('item', 'billed','quantity','quantityUnit','priceUnit'),

  /**
    Recalculate tax.
  */
  taxCriteriaDidChange: function() {
    var that = this,
        status = that.get('status'),
        taxTotal = 0, taxDetail = [];
   
    if(status === SC.Record.READY_NEW || 
       status === SC.Record.READY_DIRTY) 
    {
      // request a calculated estimate 
      var taxZone = that.getPath('invoice.taxZone.id'),
          taxType = that.getPath('taxType.id'),
          effective = that.getPath('invoice.invoiceDate').toFormattedString('%Y-%m-%d'),
          currency = that.getPath('invoice.currency.id'),
          amount = that.get('extendedPrice'), dispatch,
          store = that.get('store');

      taxZone = taxZone ? taxZone : -1;
      taxType = taxType ? taxType : -1;
      
      // callback
      callback = function(err, result) {
        var store = that.get('store');
        for(var i = 0; i < result.get('length'); i++) {
          var storeKey, taxCode, detail,
              tax = SC.Math.round(result[i].tax, XM.SALES_PRICE_SCALE);
          taxTotal = taxTotal + tax,
          storeKey = store.loadRecord(XM.TaxCode, result[i].taxCode);
          taxCode = store.materializeRecord(storeKey);
          detail = SC.Object.create({ 
            taxCode: taxCode, 
            tax: tax 
          });
          taxDetail.push(detail);
        }
        that.setIfChanged('taxDetail', taxDetail);
        that.setIfChanged('tax', taxTotal);
      }

      // define call
      dispatch = XM.Dispatch.create({
        className: 'XM.InvoiceLine',
        functionName: 'calculateTax',
        parameters: [taxZone, taxType, effective, currency, amount],
        target: that,
        action: callback
      });
      
      // do it
      store.dispatch(dispatch);
    } else {
      // add up stored result
      var taxes = this.get('taxes');

      // Loop through tax detail
      for(var i = 0; i < taxes.get('length'); i++) {
        var hist = taxes.objectAt(i),
            tax = SC.Math.round(hist.get('tax'), XM.SALES_PRICE_SCALE),
            taxCode = hist.get('taxCode'),
            codeTax;
        taxTotal = taxTotal + tax;
        codeTax = SC.Object.create({
          taxCode: taxCode,
          tax: tax
        });
        taxDetail.push(codeTax);  
      }    
      this.setIfChanged('taxDetail', taxDetail);
      this.setIfChanged('tax', taxTotal);
    }
  }.observes('extendedPrice', 'taxType'),
  /*
  invoiceDidChange: function() {
    var status = this.get('status'),
        lineNumber = this.get('lineNumber')
    if (status === SC.Record.READY_NEW && !lineNumber) {
      var lines = this.getPath('invoice'),
           maxNumber = 0;
       
      for (var i = 0; i < lines.get('length'); i++) {
        var num = lines.objectAt(i).get('lineNumber');
        maxNumber = num > nextNumber ? num : maxNumber;
      }
      
    }
    this.set('lineNumber', maxNumber + 1);
  }.observes('invoice')
  */

});
