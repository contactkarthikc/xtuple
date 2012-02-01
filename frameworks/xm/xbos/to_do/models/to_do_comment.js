// ==========================================================================
// Project:   xTuple PostBooks - xTuple Business Management Framework
// Copyright: ©2011 OpenMFG LLC, d/b/a xTuple
// ==========================================================================
/*globals XM */

sc_require('xbos/comment/models/comment');

/** @class

  Comment for To-Do.

  @extends XM.Comment
*/
XM.ToDoComment = XM.Comment.extend(
/** @scope XM.ToDoComment.prototype */ {

  className: 'XM.ToDoComment',

  /**
  type XM.ToDo
  */
  toDo: SC.Record.toOne('XM.ToDo', {
    inverse:  'comments',
    isMaster: NO,
  }),

});

