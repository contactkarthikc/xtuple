/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, enyo:true*/

(function () {

  XT.extensions.inventory.initWorkspaces = function () {
    var extensions;

    // ..........................................................
    // CONFIGURE
    //

    enyo.kind({
      name: "XV.InventoryWorkspace",
      kind: "XV.Workspace",
      title: "_configure".loc() + " " + "_inventory".loc(),
      model: "XM.Inventory",
      components: [
        {kind: "Panels", arrangerKind: "CarouselArranger",
          fit: true, components: [
          {kind: "XV.Groupbox", name: "mainPanel", components: [
            {kind: "XV.ScrollableGroupbox", name: "mainGroup", fit: true,
              classes: "in-panel", components: [
              {kind: "onyx.GroupboxHeader", content: "_reporting".loc()},
              {kind: "XV.NumberWidget", attr: "DefaultEventFence",
                label: "_defaultEventFence".loc(), formatting: false},
              {kind: "onyx.GroupboxHeader", content: "_changeLog".loc()},
              {kind: "XV.ToggleButtonWidget", attr: "WarehouseChangeLog",
                label: "_postSiteChanges".loc()},
              {kind: "XV.ToggleButtonWidget", attr: "ItemSiteChangeLog",
                label: "_postItemSiteChanges".loc()},
              {kind: "onyx.GroupboxHeader", content: "_costing".loc()},
              {kind: "XV.ToggleButtonWidget", attr: "AllowAvgCostMethod",
                label: "_allowAvgCostMethod".loc()},
              {kind: "XV.ToggleButtonWidget", attr: "AllowStdCostMethod",
                label: "_allowStdCostMethod".loc()},
              {kind: "XV.ToggleButtonWidget", attr: "AllowJobCostMethod",
                label: "_allowJobCostMethod".loc()},
              {kind: "XV.PickerWidget", attr: "CountAvgCostMethod",
                label: "_countAvgCostMethod".loc(), collection: "XM.countAvgCostMethod"},
              {kind: "onyx.GroupboxHeader", content: "_physicalInventory".loc()},
              {kind: "XV.PickerWidget", attr: "PostCountTagToDefault",
                label: "_postCountTagToDefault".loc(), collection: "XM.postCountTagToDefault"},
              {kind: "XV.PickerWidget", attr: "CountSlipAuditing",
                label: "_countSlipAuditing".loc(), collection: "XM.countSlipAuditing"},
              {kind: "onyx.GroupboxHeader", content: "_shippingAndReceiving".loc()},
              {kind: "XV.NumberPolicyPicker", attr: "ShipmentNumberGeneration",
                label: "_shipmentNumberPolicy".loc()},
              {kind: "XV.NumberWidget", attr: "NextShipmentNumber",
                label: "_nextShipmentNumber".loc(), formatting: false},
              {kind: "XV.ToggleButtonWidget", attr: "KitComponentInheritCOS",
                label: "_kitComponentInheritCOS".loc()},
              {kind: "XV.ToggleButtonWidget", attr: "DisallowReceiptExcessQty",
                label: "_disableReceiptExcessQty".loc()},
              {kind: "XV.ToggleButtonWidget", attr: "WarnIfReceiptQtyDiffers",
                label: "_warnIfReceiptQtyDiffers".loc()},
              {kind: "XV.NumberWidget", attr: "ReceiptQtyTolerancePct",
                label: "_receiptQtyTolerancePct".loc(), formatting: false},
              {kind: "XV.ToggleButtonWidget", attr: "RecordPPVonReceipt",
                label: "_recordPPVOnReceipt".loc()}
            ]}
          ]}
        ]}
      ]
    });

    // ..........................................................
    // ENTER RECEIPT
    //

    enyo.kind({
      name: "XV.EnterReceiptWorkspace",
      kind: "XV.Workspace",
      title: "_enterReceipt".loc(),
      model: "XM.PurchaseOrderLine",
      components: [
        {kind: "Panels", arrangerKind: "CarouselArranger",
          fit: true, components: [
          {kind: "XV.Groupbox", name: "mainPanel", components: [
            {kind: "onyx.GroupboxHeader", content: "_order".loc()},
            {kind: "XV.ScrollableGroupbox", name: "mainGroup",
              classes: "in-panel", fit: true, components: [
              {kind: "XV.PurchaseOrderWidget", attr: "purchaseOrder"},
              {kind: "onyx.GroupboxHeader", content: "_item".loc()},
              {kind: "XV.ItemSiteWidget", attr:
                {item: "itemSite.item", site: "itemSite.site"}
              },
              {kind: "XV.QuantityWidget", attr: "ordered"},
              {kind: "XV.QuantityWidget", attr: "received"},
              {kind: "XV.QuantityWidget", attr: "returned"},
              {kind: "onyx.GroupboxHeader", content: "_receive".loc()},
              {kind: "XV.QuantityWidget", attr: "toReceive", name: "toReceive"},
            ]}
          ]},
        ]}
      ],
      attributesChanged: function () {
        this.inherited(arguments);
        var model = this.getValue();
        if (!this._focused && model &&
          model.getStatus() === XM.Model.READY_DIRTY) {
          this.$.toReceive.focus();
          this.$.toReceive.$.input.selectContents();
          this._focused = true;
        }
      }
    });

    XV.registerModelWorkspace("XM.PurchaseOrderLine", "XV.EnterReceiptWorkspace");

    // ..........................................................
    // ISSUE STOCK
    //

    enyo.kind({
      name: "XV.IssueStockWorkspace",
      kind: "XV.Workspace",
      title: "_issueStock".loc(),
      model: "XM.IssueToShipping",
      saveText: "_issue".loc(),
      hideApply: true,
      hideRefresh: true,
      dirtyWarn: false,
      handlers: {
        onDetailSelectionChanged: "toggleDetailSelection"
      },
      components: [
        {kind: "Panels", arrangerKind: "CarouselArranger",
          fit: true, components: [
          {kind: "XV.Groupbox", name: "mainPanel", components: [
            {kind: "onyx.GroupboxHeader", content: "_order".loc()},
            {kind: "XV.ScrollableGroupbox", name: "mainGroup",
              classes: "in-panel", fit: true, components: [
              {kind: "XV.SalesOrderWidget", attr: "order"},
              {kind: "XV.ShipmentWidget", attr: "shipment"},
              {kind: "onyx.GroupboxHeader", content: "_item".loc()},
              {kind: "XV.ItemSiteWidget", attr:
                {item: "itemSite.item", site: "itemSite.site"}
              },
              {kind: "XV.QuantityWidget", attr: "ordered"},
              {kind: "XV.QuantityWidget", attr: "shipped"},
              {kind: "XV.QuantityWidget", attr: "returned"},
              {kind: "XV.QuantityWidget", attr: "balance"},
              {kind: "XV.QuantityWidget", attr: "atShipping"},
              {kind: "onyx.GroupboxHeader", content: "_issue".loc()},
              {kind: "XV.QuantityWidget", attr: "toIssue", name: "toIssue"},
            ]}
          ]},
          {kind: "XV.IssueToShippingDetailRelationsBox", attr: "itemSite.detail", fit: true}
        ]}
      ],
      attributesChanged: function () {
        this.inherited(arguments);
        var model = this.getValue();
        if (!this._focused && model &&
          model.getStatus() === XM.Model.READY_DIRTY) {
          this.$.toIssue.focus();
          this.$.toIssue.$.input.selectContents();
          this._focused = true;
        }
      },
      /**
        If detail has been selected or deselected, handle default distribution.
      */
      toggleDetailSelection: function (inSender, inEvent) {
        var detail = inEvent.model,
          undistributed = this.getValue().undistributed;
        if (!detail) { return; }
        if (inEvent.isSelected) {
          detail.distribute(undistributed);
        } else {
          detail.clear();
        }
      }
    });

    // ..........................................................
    // LOCATION
    //

    enyo.kind({
      name: "XV.LocationWorkspace",
      kind: "XV.Workspace",
      title: "_location".loc(),
      model: "XM.Location",
      components: [
        {kind: "Panels", arrangerKind: "CarouselArranger",
          fit: true, components: [
          {kind: "XV.Groupbox", name: "mainPanel", components: [
            {kind: "onyx.GroupboxHeader", content: "_location".loc()},
            {kind: "XV.ScrollableGroupbox", name: "mainGroup",
              classes: "in-panel", fit: true, components: [
              {kind: "XV.SiteZonePicker", attr: "siteZone"},
              {kind: "XV.CheckboxWidget", attr: "netable"},
              {kind: "XV.CheckboxWidget", attr: "restricted"},
              {kind: "XV.InputWidget", attr: "aisle"},
              {kind: "XV.InputWidget", attr: "rack"},
              {kind: "XV.InputWidget", attr: "bin"},
              {kind: "XV.InputWidget", attr: "location"},
              {kind: "XV.TextArea", fit: true, attr: "description"},
            ]}
          ]},
          {kind: "XV.LocationItemRelationBox", attr: "items"}
        ]}
      ]
    });

    XV.registerModelWorkspace("XM.Location", "XV.LocationWorkspace");
    XV.registerModelWorkspace("XM.LocationItem", "XV.LocationWorkspace");

    // ..........................................................
    // SHIPMENT
    //

    enyo.kind({
      name: "XV.ShipmentWorkspace",
      kind: "XV.Workspace",
      title: "_shipment".loc(),
      model: "XM.Shipment",
      components: [
        {kind: "Panels", arrangerKind: "CarouselArranger",
          fit: true, components: [
          {kind: "XV.Groupbox", name: "mainPanel", fit: true, components: [
            {kind: "onyx.GroupboxHeader", content: "_overview".loc()},
            {kind: "XV.ScrollableGroupbox", name: "mainGroup",
              classes: "in-panel", fit: true, components: [
              {kind: "XV.InputWidget", attr: "number"},
              {kind: "XV.SalesOrderWidget", attr: "order"},
              {kind: "XV.ShipViaCombobox", attr: "shipVia"},
              {kind: "XV.DateWidget", attr: "shipDate"},
              {kind: "XV.CustomerProspectWidget", attr: "order.customer.number",
                showAddress: true, label: "_customer".loc(),
                nameAttribute: ""},
              {kind: "XV.MoneyWidget",
                attr: {localValue: "freight", currency: "currency"},
                label: "_freight".loc()},
              {kind: "onyx.GroupboxHeader", content: "_notes".loc()},
              {kind: "XV.TextArea", attr: "notes", fit: true}
            ]}
          ]},
          {kind: "XV.ShipmentLineRelationsBox", attr: "lineItems", fit: true}
        ]}
      ]
    });

    XV.registerModelWorkspace("XM.ShipmentLine", "XV.ShipmentWorkspace");
    XV.registerModelWorkspace("XM.Shipment", "XV.ShipmentWorkspace");

    // ..........................................................
    // ITEM SITE
    //

    extensions = [
      {kind: "onyx.GroupboxHeader", container: "mainGroup", content: "_inventory".loc() },
      {kind: "XV.ControlMethodPicker", container: "mainGroup", attr: "controlMethod"},
      {kind: "XV.CostMethodPicker", container: "mainGroup", attr: "costMethod"},
      {kind: "XV.CheckboxWidget", container: "mainGroup", attr: "isStocked"},
      {kind: "XV.CheckboxWidget", container: "mainGroup", attr: "isAutomaticAbcClassUpdates"},
      {kind: "XV.AbcClassPicker", container: "mainGroup", attr: "abcClass"},
      //TODO: Create an XV widget that includes an integer input field and an increase and decrease button
      {kind: "XV.NumberWidget", container: "mainGroup", attr: "cycleCountFrequency", scale: 0},
      {kind: "onyx.GroupboxHeader", container: "mainGroup", content: "_location".loc() },
      {kind: "XV.CheckboxWidget", container: "mainGroup", attr: "isLocationControl"},
      //TODO: Add default location checkbox
      //PICKER   - LOCATION/USER-DEFINED - (display the following 3/6 OR USERDEFINED)
      {kind: "XV.LocationPicker", container: "mainGroup", attr: "receiveLocation"},
      {kind: "XV.CheckboxWidget", container: "mainGroup", attr: "isReceiveLocationAuto"},
      {kind: "XV.LocationPicker", container: "mainGroup", attr: "stockLocation"},
      {kind: "XV.CheckboxWidget", container: "mainGroup", attr: "isStockLocationAuto"},
      {kind: "XV.InputWidget", container: "mainGroup", attr: "userDefinedLocation"},
      {kind: "XV.InputWidget", container: "mainGroup", attr: "locationComment"},
      //LIST     - RESTRICTED LOCATIONS restrictedLocationsAllowed from xm.item_site_location
      {kind: "onyx.GroupboxHeader", container: "mainGroup", content: "_planning".loc() },
      {kind: "XV.CheckboxWidget", container: "mainGroup", attr: "useParameters"},
      {kind: "XV.QuantityWidget", container: "mainGroup", attr: "reorderLevel"},
      {kind: "XV.QuantityWidget", container: "mainGroup", attr: "orderToQuantity"},
      {kind: "XV.QuantityWidget", container: "mainGroup", attr: "minimumOrderQuantity"},
      {kind: "XV.QuantityWidget", container: "mainGroup", attr: "maximumOrderQuantity"},
      {kind: "XV.QuantityWidget", container: "mainGroup", attr: "orderMultipleQuantity"},
      {kind: "XV.CheckboxWidget", container: "mainGroup", attr: "useParametersManual"},
      {kind: "XV.QuantityWidget", container: "mainGroup", attr: "safetyStock"},
      {kind: "XV.NumberWidget", container: "mainGroup", attr: "leadTime", scale: 0}

    ];

    XV.appendExtension("XV.ItemSiteWorkspace", extensions);
    
  };
}());
