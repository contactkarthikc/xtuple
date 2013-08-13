/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true, Backbone:true, _:true, console:true */

(function () {
  "use strict";

  XT.extensions.inventory.initInventoryModels = function () {

    /**
      @class

      @extends XM.Model
    */
    XM.InventoryHistory = XM.Model.extend({

      recordType: "XM.InventoryHistory"

    });

    /**
      @class

      @extends XM.Model
    */
    XM.InventoryDetail = XM.Model.extend({

      recordType: "XM.InventoryDetail"

    });

    /**
      @class

      @extends XM.Model
    */
    XM.IssueToShipping = XM.Model.extend({

      recordType: 'XM.IssueToShipping',

      readOnlyAttributes: [
        "atShipping",
        "balance",
        "item",
        "order",
        "ordered",
        "returned",
        "site",
        "shipment",
        "shipped"
      ],

      name: function () {
        return this.get("order") + " #" + this.get("lineNumber");
      },

      bindEvents: function () {
        XM.Model.prototype.bindEvents.apply(this, arguments);

        // Bind events
        this.on('statusChange', this.statusDidChange);
      },

      canIssueStock: function (callback) {
        if (callback) {
          callback(true);
        }
        return this;
      },

      canReturnStock: function (callback) {
        if (callback) {
          callback(false);
        }
        return this;
      },

      doIssueStock: function (callback) {
        if (callback) {
          callback(true);
        }
        return this;
      },

      doReturnStock: function (callback) {
        if (callback) {
          callback(true);
        }
        return this;
      },

      save: function (key, value, options) {
        options = options ? _.clone(options) : {};

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (_.isEmpty(key)) {
          options = value ? _.clone(value) : {};
        }

        var that = this,
          callback;
        
        // Callback for after we determine quantity validity
        callback = function (resp) {
          if (!resp.answer) { return; }

          // Need to get more info about the itemsite first
          var query = {},
            itemSites = new XM.ItemSiteRelationCollection(),
            fetchOptions = {query: query};

          fetchOptions.success = function () {
            var K = XM.ItemSite,
              itemSite = itemSites.at(0),
              issOptions = {},
              params = [
                that.id,
                that.get("toIssue"),
                issOptions
              ],
              locationControl = itemSite.get("locationControl"),
              controlMethod = itemSite.controlMethod,
              // Techically check for LOT / SERIAL should be done in standard ed.
              // but let's just get it working for now.
              requiresDetail = locationControl ||
                controlMethod === K.LOT_CONTROL ||
                controlMethod === K.SERIAL_CONTROL,

              // Callback to handle detail if applicable
              callback = function (resp) {
                var dispOptions = {};

                // Refresh the model we started from passing options through
                dispOptions.success = function () {
                  that.fetch(options);
                };
                if (resp) {
                  issOptions.detail = resp;
                }
                that.dispatch("XM.Inventory", "issueToShipping", params, dispOptions);

              };
            if (requiresDetail) {
              that.notify("_distributionDetail".loc(), {
                type: XM.Model.QUESTION,
                locationControl: locationControl,
                controlMethod: controlMethod
              });
            } else {
              callback();
            }
          };

          query.parameters = [
            {
              attribute: "item",
              value: that.get("item")
            },
            {
              attribute: "site",
              value: that.get("site")
            }
          ];

          itemSites.fetch(fetchOptions);
        };

        // Validate
        if (this.get("toIssue") <= 0) {
          this.trigger('invalid', this, XT.Error.clone('xt2013'), options || {});
        } else if (!this.issueBalance() && this.get("toIssue") > 0) {
          this.notify("_issueExcess".loc(), {
            type: XM.Model.QUESTION,
            callback: callback
          });
        } else {
          callback({answer: true});
        }

        return this;
      },

      issueBalance: function () {
        var balance = this.get("balance"),
          atShipping = this.get("atShipping"),
          toIssue = XT.math.subtract(balance, atShipping, XT.QUANTITY_SCALE);
        return toIssue >= 0 ? toIssue : 0;
      },

      statusDidChange: function () {
        if (this.getStatus() === XM.Model.READY_CLEAN) {
          this.set("toIssue", this.issueBalance());
        }
      }


    });

    // ..........................................................
    // COLLECTIONS
    //

    /**
      @class

      @extends XM.Collection
    */
    XM.InventoryHistoryCollection = XM.Collection.extend({

      model: XM.InventoryHistory

    });

    /**
      @class

      @extends XM.Collection
    */
    XM.IssueToShippingCollection = XM.Collection.extend({

      model: XM.IssueToShipping

    });

  };

}());

