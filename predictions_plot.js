var bblimits = bblimits || {}


bblimits.predictions_plot = new function()
{
  this._canvas = $('#predictions_plot');
  this._context = this._canvas[0].getContext("2d");
  var font_args = this._context.font.split(' ');
  this._context.font = "16px " + font_args[font_args.length - 1];
  this._axis_size = 45;
  this._mode = -1; // Modes < 0 indicate half-life, >=0 is an index into this._M_data
  this._height = this._context.canvas.height - this._axis_size;
  this._width = this._context.canvas.width - this._axis_size;
  this._x = [2014, 2022];
  this._y = [1e25, 1e27];
  this._x_A = 136;
  this._y_A = 76;
  this._predictions = [{name : "SNO+", colour : "Red", A : 130, T : 9.4e25, years : 5, year : 2021},
                       {name : "CUORE", colour : "Green", A : 130, T : 9.5e25, years : 5, year : 2020},
                       {name : "KamLAND-Zen", colour : "Blue", A : 136, T : 1.9e25, years : 0.58, year : 2013},
                       {name : "EXO", colour : "DarkBlue", A : 136, T : 1.6e25, years : 0.33, year : 2012},
                       {name : "GERDA", colour : "DarkCyan", A : 76, T : 2.1e25, years : 1.35, year : 2013}];
  this._G_data = {x : [48, 76, 82, 96, 100, 110, 116, 124, 128, 130, 136, 148, 150, 154, 160, 198, 232, 238],
                  y : [24.81, 2.363, 10.16, 20.58, 15.92, 4.815, 16.7, 9.040, 0.5878, 14.22, 14.58, 10.1, 63.03, 3.015, 9.559, 7.556, 13.93, 33.61]};
  this._M_data = [{name : "IBM-2", g_a : 1.269, visible : true,
                   x : [48, 76, 82, 96, 100, 110, 116, 124, 128, 130, 136, 148, 150, 154, 160, 198],
                   y : [1.98, 5.42, 4.37, 2.53, 3.73, 3.62, 2.78, 3.50, 4.48, 4.03, 3.33, 1.98, 2.32, 2.50, 3.62, 1.88]},
                  {name : "QRPA-Tü", g_a : 1.254, visible : true,
                   x : [76, 82, 96, 100, 116, 128, 130, 136],
                   y : [4.68, 4.17, 1.34, 3.53, 2.93, 3.77, 3.38, 2.22]},
                  {name : "ISM", g_a : 1.25, visible : true,
                   x : [48, 76, 82, 124, 128, 130, 136],
                   y : [0.54, 2.22, 2.11, 2.02, 2.26, 2.04, 1.70]}];

  $("input:radio[name=predictions_mode]").on('change', function(event) {bblimits.predictions_plot.change_mode($(this).val());});

  this.change_mode = function(mode)
  {
    if(mode < 0)
      this._y = [1e25, 1e27]; 
    else
      this._y = [5e1, 4e2];
    this._mode = mode;
    this.draw();
  };

  this._value_to_pixel = function(value)
  {
    return [(value[0] - this._x[0]) / (this._x[1] - this._x[0])  * this._width + this._axis_size,
            Math.log(this._y[1] / value[1]) / Math.log(this._y[1] / this._y[0]) * this._height];
  };

  this.draw = function()
  {
    this._context.save();
    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    this.draw_data();
    this._context.restore();
    this.draw_axis();
    this.draw_legend();
  };

  this.draw_data = function()
  {
    for(var iprediction = 0; iprediction < this._predictions.length; iprediction++)
    {
      this._context.strokeStyle = this._predictions[iprediction].colour;
      this._context.beginPath();
      var y = this.extrapolate(this._x[1], this._predictions[iprediction].T, this._predictions[iprediction].year, this._predictions[iprediction].years);
      var pixel = this._value_to_pixel([this._x[1], y]);
      this._context.moveTo(pixel[0], pixel[1]);
      for(var x = this._x[1]; x >= this._x[0]; x -= 0.05)
      {
        var y = this.extrapolate(x, this._predictions[iprediction].T, this._predictions[iprediction].year, this._predictions[iprediction].years);
        if(this._mode >= 0)
          y = this.half_life_to_mass(y, this._predictions[iprediction].A);
        pixel = this._value_to_pixel([x, y]);
        if(pixel[1] < this._height)
          this._context.lineTo(pixel[0], pixel[1]);
      }
      this._context.stroke();
      this._context.closePath();
    }
  };

  this.extrapolate = function(x, half_life, date, years)
  {
    // T ~ a t^1/2
    var a = half_life / Math.pow(years, 0.5);
    return a * Math.pow(x - (date - years), 0.5);
  };

  this.half_life_to_mass = function(half_life, A)
  {
    var G = 0.0;
    for(var point = 0; point < this._G_data.x.length; point++)
    {
      if(A === this._G_data.x[point])
        G = this._G_data.y[point] * Math.pow(10, -15);
    }
    var data = this._M_data[this._mode];
    var GMM = G;
    for(var point = 0; point < data.x.length; point++)
    {
      if(A === data.x[point])
        GMM *= data.y[point] * data.y[point] * Math.pow(data.g_a, 4);
    }
    return Math.sqrt(Math.pow(511e6, 2) / (GMM * half_life));
  };

  this.draw_legend = function()
  {
    this._context.save();
    for(var iprediction = 0; iprediction < this._predictions.length; iprediction++)
      {
        this._context.fillStyle = this._predictions[iprediction].colour;
        if(this._mode < 0)
          this._context.fillText(this._predictions[iprediction].name, this._axis_size + 10, 25 + iprediction * 16);
        else
          this._context.fillText(this._predictions[iprediction].name, this._axis_size + this._width - 120, 25 + iprediction * 16);
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
    for(var x = this._x[0]; x < this._x[1]; x += 0.5)
    {
      var pixel = this._value_to_pixel([x, this._y[0]]);
      var step = 2;
      if(Math.abs(x - Math.round(x)) <= 0.1)
      {
        step = 4;
        this._context.fillText(x, pixel[0], pixel[1] + 16);
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
        this._context.fillText("10", pixel[0] - 29, pixel[1]);
        this._context.save();
        var font_args = this._context.font.split(' ');
        this._context.font = "10px " + font_args[font_args.length - 1];
        this._context.fillText(Math.round(Math.log(y) / Math.LN10), pixel[0] - 14, pixel[1] - 12);
        this._context.restore();
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
    this._context.fillText("Year", this._axis_size + this._width / 2 - 20, this._height + 32);
    this._context.translate(12, this._height / 2 + 50);
    this._context.rotate(-Math.PI/2);
    if(this._mode < 0)
      this._context.fillText("Half-life yr^-1, A=" + this._y_A, 0, 0);
    else
      this._context.fillText("Mass meV", 0, 0);
    this._context.restore();
  };
  this.draw();
};
