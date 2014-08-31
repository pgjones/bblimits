var bblimits = bblimits || {}


bblimits.limit_plot = new function()
{
  this._canvas = $('#limit_plot');
  this._context = this._canvas[0].getContext("2d");
  var font_args = this._context.font.split(' ');
  this._context.font = "16px " + font_args[font_args.length - 1];
  this._axis_size = 45;
  this._height = this._context.canvas.height - this._axis_size;
  this._width = this._context.canvas.width - this._axis_size;
  this._x = [1e24, 1e26];
  this._y = [1e24, 1e26];
  this._x_A = 136;
  this._y_A = 76;
  this._limits = [{name : "EXO", A : 136, T : 1.6e25},
                  {name : "KamLAND", A : 136, T : 1.9e25},
                  {name : "GERDA", A : 76, T : 2.1e25}];
  this._G_data = {x : [48, 76, 82, 96, 100, 110, 116, 124, 128, 130, 136, 148, 150, 154, 160, 198, 232, 238],
                  y : [24.81, 2.363, 10.16, 20.58, 15.92, 4.815, 16.7, 9.040, 0.5878, 14.22, 14.58, 10.1, 63.03, 3.015, 9.559, 7.556, 13.93, 33.61]};
  this._M_data = [{name : "IBM-2", colour : "Green", g_a : 1.269, visible : true,
                   x : [48, 76, 82, 96, 100, 110, 116, 124, 128, 130, 136, 148, 150, 154, 160, 198],
                   y : [1.98, 5.42, 4.37, 2.53, 3.73, 3.62, 2.78, 3.50, 4.48, 4.03, 3.33, 1.98, 2.32, 2.50, 3.62, 1.88]},
                  {name : "QRPA-Tü", colour : "Red", g_a : 1.254, visible : true,
                   x : [76, 82, 96, 100, 116, 128, 130, 136],
                   y : [4.68, 4.17, 1.34, 3.53, 2.93, 3.77, 3.38, 2.22]},
                  {name : "ISM", colour : "Blue", g_a : 1.25, visible : true,
                   x : [48, 76, 82, 124, 128, 130, 136],
                   y : [0.54, 2.22, 2.11, 2.02, 2.26, 2.04, 1.70]}];

  this._value_to_pixel = function(value)
  {
    return [Math.log(value[0] / this._x[0]) / Math.log(this._x[1] / this._x[0])  * this._width + this._axis_size,
            Math.log(this._y[1] / value[1]) / Math.log(this._y[1] / this._y[0]) * this._height];
  };

  this.draw = function()
  {
    this._context.save();
    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    this.draw_limits();
    this.draw_mass();
    this._context.restore();
    this.draw_axis();
    this.draw_legend();
  };

  this.draw_limits = function()
  {
    this._context.save();
    for(var limit = 0; limit < this._limits.length; limit++)
    {
      if(this._x_A === this._limits[limit].A)
      {
        this._context.beginPath();
        var pixel = this._value_to_pixel([this._limits[limit].T, this._y[0]]);
        this._context.moveTo(pixel[0], pixel[1]);
        pixel = this._value_to_pixel([this._limits[limit].T, this._y[1]]);
        this._context.lineTo(pixel[0], pixel[1]);
        this._context.stroke();
        this._context.closePath();
        this._context.save();
        this._context.translate(pixel[0] - 2, this._height - 10);
        this._context.rotate(-Math.PI/2);
        this._context.fillText(this._limits[limit].name, 0, 0);
        this._context.restore();
      }
      if(this._y_A === this._limits[limit].A)
      {
        this._context.beginPath();
        var pixel = this._value_to_pixel([this._x[0], this._limits[limit].T]);
        this._context.moveTo(pixel[0], pixel[1]);
        pixel = this._value_to_pixel([this._x[1], this._limits[limit].T]);
        this._context.lineTo(pixel[0], pixel[1]);
        this._context.stroke();
        this._context.closePath();
        this._context.fillText(this._limits[limit].name, this._axis_size + 10, pixel[1] - 2);
      }
    }
    this._context.restore();
  };

  this.draw_mass = function()
  {
    var xG = 0.0;
    var yG = 0.0;
    for(var point = 0; point < this._G_data.x.length; point++)
    {
      if(this._x_A === this._G_data.x[point])
        xG = this._G_data.y[point] * Math.pow(10, -15);
      if(this._y_A === this._G_data.x[point])
        yG = this._G_data.y[point] * Math.pow(10, -15);
    }
    for(var model = 0; model < this._M_data.length; model++)
    {
      var data = this._M_data[model];
      var xGMM = xG;
      var yGMM = yG;
      for(var point = 0; point < data.x.length; point++)
      {
        if(this._x_A === data.x[point])
          xGMM *= data.y[point] * data.y[point] * Math.pow(data.g_a, 4);
        if(this._y_A === data.x[point])
          yGMM *= data.y[point] * data.y[point] * Math.pow(data.g_a, 4);
      }
      this._context.save();
      this._context.strokeStyle = data.colour;
      this._context.beginPath();
      var value = [this._x[0], this._x[0] * xGMM / yGMM];
      var pixel = this._value_to_pixel(value);
      if(pixel[1] > this._height)
      {
        var x = this._y[0] * yGMM / xGMM; // x intercept
        value = [x, x * xGMM / yGMM];
        pixel = this._value_to_pixel(value);
      }
      this._context.moveTo(pixel[0], pixel[1]);
      value = [this._x[1], this._x[1] * xGMM / yGMM];
      pixel = this._value_to_pixel(value);
      this._context.lineTo(pixel[0], pixel[1]);
      this._context.stroke();
      this._context.closePath();
      this._context.restore();
      // Now the tick marks
      this._context.save();
      var font_args = this._context.font.split(' ');
      this._context.font = "10px " + font_args[font_args.length - 1];
      for(var mass = 20; mass < 1100; mass += 20)
      {
        if(mass > 100 && mass % 100 !== 0)
          continue;
        var value = [1.0 / (xGMM * mass * mass / (511e6 * 511e6)),
                     1.0 / (yGMM * mass * mass / (511e6 * 511e6))];
        var pixel = this._value_to_pixel(value);
        if(pixel[1] <= this._height && pixel[0] >= this._axis_size)
        {
          this._context.fillRect(pixel[0] - 1, pixel[1] - 1, 2, 2);
          if(mass < 100)
            this._context.fillText(mass, pixel[0] - 13, pixel[1]);
          else if(mass < 1000)
            this._context.fillText(mass, pixel[0] - 18, pixel[1]);
          else
            this._context.fillText(mass, pixel[0] - 23, pixel[1]);
        }
      }
      this._context.restore();
    }
  };

  this.draw_legend = function()
  {
    this._context.save();
    for(var model = 0; model < this._M_data.length; model++)
      {
        var data = this._M_data[model];
        this._context.fillStyle = data.colour;
        this._context.fillText(data.name, this._axis_size + 10, 25 + model * 16);
      }
    this._context.restore();
  };

  this.draw_axis = function()
  {
    this._context.save();
    this._context.strokeStyle = "Black";
    this._context.lineWidth = 2;
    this._context.beginPath();
    this._context.moveTo(this._axis_size, 1);
    this._context.lineTo(this._axis_size, this._height + 1);
    this._context.lineTo(this._axis_size + this._width - 1, this._height + 1);
    this._context.lineTo(this._axis_size + this._width - 1, 1);
    this._context.lineTo(this._axis_size, 1);
    this._context.stroke();
    this._context.closePath();
    // Now draw the ticks and labels
    for(var x = this._x[0]; x < this._x[1]; x += Math.pow(10, Math.floor(Math.log(x) / Math.LN10)))
    {
      var pixel = this._value_to_pixel([x, this._y[0]]);
      var step = 2;
      if(Math.abs(Math.log(x) / Math.LN10 - Math.round(Math.log(x) / Math.LN10)) <= 0.01)
      {
        step = 4;
        this._context.fillText(Math.round(Math.log(x) / Math.LN10), pixel[0], pixel[1] + 16);
      }
      this._context.beginPath();
      this._context.moveTo(pixel[0], pixel[1]);
      this._context.lineTo(pixel[0], pixel[1] - step);
      this._context.stroke();
      this._context.closePath();
      this._context.beginPath();
      this._context.moveTo(pixel[0], 2);
      this._context.lineTo(pixel[0], 2 + step);
      this._context.stroke();
      this._context.closePath();
    }
    for(var y = this._y[0]; y < this._y[1]; y += Math.pow(10, Math.floor(Math.log(y) / Math.LN10)))
    {
      var pixel = this._value_to_pixel([this._x[0], y]);
      var step = 2;
      if(Math.abs(Math.log(y) / Math.LN10 - Math.round(Math.log(y) / Math.LN10)) <= 0.01)
      {
        step = 4;
        this._context.fillText(Math.round(Math.log(y) / Math.LN10), pixel[0] - 25, pixel[1]);
      }
      this._context.beginPath();
      this._context.moveTo(pixel[0] + 1, pixel[1]);
      this._context.lineTo(pixel[0] + 1 + step, pixel[1]);
      this._context.stroke();
      this._context.closePath();
      this._context.beginPath();
      this._context.moveTo(this._axis_size + this._width - 2, pixel[1]);
      this._context.lineTo(this._axis_size + this._width - 2 - step, pixel[1]);
      this._context.stroke();
      this._context.closePath();

    }
    // Finally the axis labels
    this._context.fillText("Half-life, A=" + this._x_A, this._axis_size + this._width / 2 - 50, this._height + 32);
    this._context.translate(12, this._height / 2 + 20);
    this._context.rotate(-Math.PI/2);
    this._context.fillText("Half-life, A=" + this._y_A, 0, 0);
    this._context.restore();
  };
  this.draw();
};
