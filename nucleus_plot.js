var bblimits = bblimits || {}


bblimits.nucleus_plot = new function()
{
  var EMode = Object.freeze({G : 1, M : 2, GM : 3});
  this._canvas = $('#nucleus_plot');
  this._context = this._canvas[0].getContext("2d");
  var font_args = this._context.font.split(' ');
  this._context.font = "16px " + font_args[font_args.length - 1];
  this._axis_size = 45;
  this._mode = EMode.M;
  this._height = this._context.canvas.height - this._axis_size;
  this._width = this._context.canvas.width - this._axis_size;
  this._x = [40, 210];
  this._y = [0, 6];
  this._y_step = 0.2;
  this._y_title = "M";
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
  this._select = [-1, -1];

  this._canvas.on('mousemove', function(event) {this.mouse_move(event);}.bind(this));
  $("input:radio[name=mode]").on('change', function(event)
                                 {
                                   if($(this).val() === "G") bblimits.nucleus_plot.change_mode(1);
                                   else if($(this).val() === "M") bblimits.nucleus_plot.change_mode(2);
                                   else if($(this).val() === "GM") bblimits.nucleus_plot.change_mode(3);
                                 });
  $('#ibm_visible').on('change', function(event) {this._M_data[0].visible = !this._M_data[0].visible; this.draw();}.bind(this));
  $('#qrpa_visible').on('change', function(event) {this._M_data[1].visible = !this._M_data[1].visible; this.draw();}.bind(this));
  $('#ism_visible').on('change', function(event) {this._M_data[2].visible = !this._M_data[2].visible; this.draw();}.bind(this));

  this.mouse_move = function(event)
  {
    var x = (event.pageX - this._canvas.offset().left) / this._canvas.width() * this._context.canvas.width;
    var y = (event.pageY - this._canvas.offset().top) / this._canvas.height() * this._context.canvas.height;
    this._select = [x, y];
    this.draw();
  };

  this.change_mode = function(mode)
  {
    this._mode = mode;
    this.draw();
  };

  this._value_to_pixel = function(value)
  {
    return [(value[0] - this._x[0]) / (this._x[1] - this._x[0]) * this._width + this._axis_size,
            (this._y[1] - value[1]) / (this._y[1] - this._y[0]) * this._height];
  };

  this._pixel_to_value = function(pixel)
  {
    return [(pixel[0] - this._axis_size) / this._width * (this._x[1] - this._x[0]) + this._x[0],
            this._y[1] - pixel[1] / this._height * (this._y[1] - this._y[0])];
  };

  this.draw = function()
  {
    this._context.save();
    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    if(this._mode === EMode.M)
    {
      this.draw_M();
      this.draw_legend();
    }
    else if(this._mode === EMode.G)
      this.draw_G();
    else
    {
      this.draw_GM();
      this.draw_legend();
    }
    this._context.restore();
    this.draw_axis();
  };

  this.draw_M = function()
  {
    this._y = [0, 6];
    this._y_step = 0.2;
    this._y_title = "M";
    for(var model = 0; model < this._M_data.length; model++)
    {
      var data = this._M_data[model];
      if(!data.visible) continue;
      for(var point = 0; point < data.x.length; point++)
      {
        var pixel = this._value_to_pixel([data.x[point], data.y[point]]);
        this._context.fillStyle = data.colour;
        if(Math.abs(this._select[0] - pixel[0]) < 4 && Math.abs(this._select[1] - pixel[1]) < 4)
        {
          this._context.fillText(data.name + " (" + data.x[point] + ", " + data.y[point] + ")", this._axis_size + 10, 25);
          this._context.fillStyle = "LimeGreen";
        }
          this._context.fillRect(pixel[0] - 3, pixel[1] - 3, 6, 6);
      }
    }
  };

  this.draw_G = function()
  {
    this._y = [0, 30];
    this._y_step = 2;
    this._y_title = "G / 10^(-15) yr^-1";
    for(var point = 0; point < this._G_data.x.length; point++)
    {
      var pixel = this._value_to_pixel([this._G_data.x[point], this._G_data.y[point]]);
      this._context.fillStyle = "Black";
      if(Math.abs(this._select[0] - pixel[0]) < 4 && Math.abs(this._select[1] - pixel[1]) < 4)
      {
        this._context.fillText("(" + this._G_data.x[point] + ", " + this._G_data.y[point] + ")", this._axis_size + 10, 25);
        this._context.fillStyle = "LimeGreen";
      }
      this._context.fillRect(pixel[0] - 3, pixel[1] - 3, 6, 6);
    }
  };

  this.draw_GM = function()
  {
    this._y = [0, 300];
    this._y_step = 30;
    this._y_title = "GM^2 / 10^(-15) yr^-1";
    for(var model = 0; model < this._M_data.length; model++)
    {
      var data = this._M_data[model];
      if(!data.visible) continue;
      for(var point = 0; point < data.x.length; point++)
      {
        var GM = null;
        for(var g_point = 0; g_point < this._G_data.x.length; g_point++)
        {
          if(this._G_data.x[g_point] === data.x[point])
            GM = this._G_data.y[g_point];
        }
        if(GM === null)
          continue;
        GM *= data.y[point] * data.y[point];
        var pixel = this._value_to_pixel([data.x[point], GM]);
        this._context.fillStyle = data.colour;
        if(Math.abs(this._select[0] - pixel[0]) < 4 && Math.abs(this._select[1] - pixel[1]) < 4)
        {
          this._context.fillText(data.name + " (" + data.x[point] + ", " + GM.toFixed(1) + ")", this._axis_size + 10, 25);
          this._context.fillStyle = "LimeGreen";
        }
        this._context.fillRect(pixel[0] - 3, pixel[1] - 3, 6, 6);
      }
    }
  };


  this.draw_legend = function()
  {
    this._context.save();
    for(var model = 0; model < this._M_data.length; model++)
      {
        var data = this._M_data[model];
        if(!data.visible) continue;
        this._context.fillStyle = data.colour;
        this._context.fillText(data.name, this._axis_size + this._width - 80, 25 + model * 16);
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
    for(var x = this._x[0]; x < this._x[1]; x += 5)
    {
      var pixel = this._value_to_pixel([x, this._y[0]]);
      var step = 2;
      if(x % 20 == 0)
      {
        step = 4;
        this._context.fillText(x, pixel[0] - 5, 15 + pixel[1]);
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
    for(var y = this._y[0]; y < this._y[1]; y += this._y_step)
    {
      var pixel = this._value_to_pixel([this._x[0], y]);
      var step = 2;
      if(Math.abs(y - Math.round(y)) <= 0.1)
      {
        step = 4;
        if(Math.round(y) < 10)
          this._context.fillText(Math.round(y), pixel[0] - 10, pixel[1]);
        else if(Math.round(y) < 100)
          this._context.fillText(Math.round(y), pixel[0] - 20, pixel[1]);
        else
          this._context.fillText(Math.round(y), pixel[0] - 30, pixel[1]);
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
    this._context.fillText("Atomic weight", this._axis_size + this._width / 2 - 30, this._height + 30);
    this._context.translate(12, this._height / 2 + 60);
    this._context.rotate(-Math.PI/2);
    this._context.fillText(this._y_title, 0, 0);
    this._context.restore();
  };
  this.draw();
};
