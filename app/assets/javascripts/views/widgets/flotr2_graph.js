(function ($, _, Backbone, Rickshaw, moment, views, collections, ColorFactory, TimeSelector){
  "use strict";

  var pastel = [
    '#239928',
    '#6CCC70',
    '#DEFFA1',
    '#DEFFA1',
    '#DEFFA1',
    '#362F2B',
    '#BFD657',
    '#FF6131',
    '#FFFF9D',
    '#BEEB9F',
    '#79BD8F',
    '#00A388'
  ].reverse();

  views.widgets.Flotr2Graph = Backbone.View.extend({

    initialize: function(options) {
      _.bindAll(this, "render", "update", "renderGraph", "updateValues", "widgetChanged");

      this.updateCollection();

      this.model.on('change', this.widgetChanged);

      this.currentColors = [];
    },

    from: function() {
      return TimeSelector.getFrom(new Date().getTime(), this.model.get('range'));
    },

    to: function() {
      return TimeSelector.getCurrent();
    },

    updateCollection: function() {
      this.collection = new collections.Datapoint({
        targets: this.model.get('targets'),
        source: this.model.get('source'),
        from: this.from(),
        to: this.to()
      });
    },

    widgetChanged: function() {
      this.updateCollection();
      this.render();
    },

    transformDatapoints: function() {
      var that = this;
      var series = this.collection.toJSON();
      series.hasData = true;
      _.each(series, function(model, index) {
        // if (model.color === undefined) {
        //   var color = null;
        //   if (that.currentColors[index] === undefined) {
        //     color = ColorFactory.get();
        //     that.currentColors.push(color);
        //   } else {
        //     color = that.currentColors[index];
        //   }
        //   model.color = color;
        // }

        model.label = model.target;
        model.data = _.map(model.datapoints, function(dp) {
          return [dp[1], dp[0]]; // rickshaw.js doesn't handle null value
        });
        if (model.data.length === 0) {
          series.hasData = false;
        }
        delete model.datapoints;
        delete model.target;
      });

      return series;
    },

    render: function() {
      this.$el.html(JST['templates/widgets/graph/flotr2_show']({ time: this.model.get('time') }));
      this.$graph = this.$('.graph-container');
      return this;
    },

    renderGraph: function(datapoints) {
      var width = this.$graph.parent().width();
      this.$graph.width(width);
      this.$graph.height(300-20);

      var options = {
        grid: {
          verticalLines: false,
          horizontalLines: false
        }
      };

      this.graph = Flotr.draw(
        this.$graph[0],
        datapoints,
        options
      );
    },

    update: function(callback) {
      var that = this;
      var options = { suppressErrors: true };

      this.updateCollection();
      return $.when(this.collection.fetch(options)).done(this.updateValues);
    },

    updateValues: function() {
      var datapoints = this.transformDatapoints();
      this.renderGraph(datapoints);
      // if (datapoints.hasData === true && this.graph) {
      //   this.updateGraphSeries(datapoints);
      //   this.graph.render();
      // } else {
      //   this.renderGraph(datapoints);
      // }
    },

    onClose: function() {
      this.model.off('change', this.render);
    }

  });

})($, _, Backbone, Rickshaw, moment, app.views, app.collections, app.helpers.ColorFactory, app.helpers.TimeSelector);