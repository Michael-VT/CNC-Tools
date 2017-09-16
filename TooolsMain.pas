unit TooolsMain;

interface

uses
  Windows, Messages, SysUtils, Variants, Classes, Graphics, Controls, Forms,
  Dialogs, StdCtrls, Grids, ExtCtrls;

type
  TForm1 = class(TForm)
    Edit1: TEdit;
    Label1: TLabel;
    Memo1: TMemo;
    Edit2: TEdit;
    Edit3: TEdit;
    Label2: TLabel;
    Label3: TLabel;
    Edit4: TEdit;
    Label4: TLabel;
    Edit5: TEdit;
    Label5: TLabel;
    Label6: TLabel;
    Label7: TLabel;
    Edit6: TEdit;
    Edit7: TEdit;
    Button1: TButton;
    Label8: TLabel;
    Edit8: TEdit;
    Label9: TLabel;
    Edit9: TEdit;
    Image1: TImage;
    CheckBox1: TCheckBox;
    CheckBox2: TCheckBox;
    Edit10: TEdit;
    Label10: TLabel;
    CheckBox3: TCheckBox;
    CheckBox4: TCheckBox;
    CheckBox5: TCheckBox;
    CheckBox6: TCheckBox;
    CheckBox7: TCheckBox;
    CheckBox8: TCheckBox;
    Button2: TButton;
    CheckBox10: TCheckBox;
    CheckBox9: TCheckBox;
    procedure Button1Click(Sender: TObject);
    procedure Image1Click(Sender: TObject);
    procedure FormResize(Sender: TObject);
    procedure Button2Click(Sender: TObject);
    procedure CheckBox9Click(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

const   SizeXYZf=10000;

var
  Form1: TForm1;
    XYc: array[0..SizeXYZf] of record
    x,y,z,f:real;
    end;

implementation

{$R *.dfm}

function desep(stta:string):string;
var i:integer;
begin
  for i := 1 to length(stta)  do
  if (stta[i]= ',') or (stta[i]= '.')then stta[i]:=DecimalSeparator;
  Result:=stta;
end;

function startMemo(z:real):integer;
begin
  Form1.Image1.Canvas.Refresh;
  Form1.Image1.Picture.Bitmap:=TBitmap.Create;
  Form1.Image1.Picture.CleanupInstance;
  Form1.Image1.Visible:=true;
  Form1.Image1.Left:=250;
  Form1.Image1.Top:=4;
  Form1.Image1.Canvas.Brush.Color:=clBlue;
  Form1.Image1.Canvas.Brush.Style:=bsSolid;
  Form1.Image1.Canvas.Pen.Color:=clBlue;
  Form1.Image1.Canvas.Pen.Style:=psSolid;
  Form1.Image1.Canvas.Pen.Width:=1;
  Form1.Image1.Picture.Bitmap.Width := Form1.Width-Form1.Image1.Left-10;
  Form1.Image1.Picture.Bitmap.Height := Form1.Height-40;
  Form1.Image1.Width:=Form1.Width-Form1.Image1.Left-10;
  Form1.Image1.Height:=Form1.Height-40;
  Form1.Memo1.Clear;
  Form1.Memo1.Lines.Add('(Rectangle)');
  if Form1.CheckBox4.Checked=true then
     Form1.Memo1.Lines.Add('(Base move by Y)')
  else
     Form1.Memo1.Lines.Add('(Base move by X)');
  if Form1.CheckBox5.Checked=true then
     Form1.Memo1.Lines.Add('(With coner drilling)');
  if Form1.CheckBox6.Checked=true then
     Form1.Memo1.Lines.Add('(With fill inside)')
  else
     Form1.Memo1.Lines.Add('(Without filling)');
  Form1.Memo1.Lines.Add('(Rectangle SX'+Form1.Edit4.Text+' SY'+Form1.Edit5.Text+')');
  Form1.Memo1.Lines.Add('(Rectangle DX'+Form1.Edit6.Text+' DY'+Form1.Edit7.Text+')');
  Form1.Memo1.Lines.Add('M03 G90 G21 G17 F'+Form1.Edit8.Text);
//  Form1.Memo1.Lines.Add('G00 Z'+FloatToStrF(z,ffFixed,6,2));
  Result:=0;
end;

//*****************************************************************************************
// f - условие, 1 - холостое перемещение инструмента, 2 - выполнение обработки инструментом
function setXY(x,y,z,f:real;pr:integer):integer;
begin
  XYc[pr].x:=x;
  XYc[pr].y:=y;
  XYc[pr].z:=z;
  XYc[pr].f:=f;
  if pr=0 then
     Form1.Memo1.Lines.Add('G0'+IntToStr(trunc(f)-1)+' Z'+FloatToStrF(z,ffFixed,6,2))
  else
  if f<>0 then
    begin
     if (z <> XYc[pr-1].z) or (f <> XYc[pr-1].f) then
       Form1.Memo1.Lines.Add('G0'+IntToStr(trunc(f)-1)+' Z'+FloatToStrF(z,ffFixed,6,2));
     if (x <> XYc[pr-1].x) or (y <> XYc[pr-1].y) then
       Form1.Memo1.Lines.Add('G0'+IntToStr(trunc(f)-1)+' X'+FloatToStrF(x,ffFixed,6,2)+' Y'+FloatToStrF(y,ffFixed,6,2));
    end;
  if (pr=0) and (f<>0) then
    begin
     Form1.Memo1.Lines.Add('G0'+IntToStr(trunc(f)-1)+' Z'+FloatToStrF(z,ffFixed,6,2));
     Form1.Memo1.Lines.Add('G0'+IntToStr(trunc(f)-1)+' X'+FloatToStrF(x,ffFixed,6,2)+' Y'+FloatToStrF(y,ffFixed,6,2));
    end;
  Result:=pr+1;
end;

procedure TForm1.Button1Click(Sender: TObject);
var i,j,k,m,nm,nz,nxy,pa,wx,wy,cpen,pin,sly:integer;
    sx,sy,dx,dy,stepx,stepxb,dz,endz,dtool,ax,ay,bx,by,cx,cy,ex,ey,fx,fy,zp,zpb,slyz:real;
    minx,miny,maxx,maxy,kx,ky:real;
begin
pin:=0;
           for i := 0 to SizeXYZf-1 do    // Iterate
            pin:= setXY(0,0,0,0,pin);

dtool :=StrToFloat(desep(Edit1.Text));
endz  :=StrToFloat(desep(Edit2.Text));
dz    :=StrToFloat(desep(Edit3.Text));
sx    :=StrToFloat(desep(Edit4.Text))+0.2;
sy    :=StrToFloat(desep(Edit5.Text))+0.2;
dx    :=StrToFloat(desep(Edit6.Text))-0.4;
dy    :=StrToFloat(desep(Edit7.Text))-0.4;
stepx :=StrToFloat(desep(Edit9.Text));
  if (dtool/2) > stepx then
      stepxb:=stepx
  else
      stepxb:=dtool/2;

  startMemo(dz);
  
  if CheckBox10.Checked = true then
      if dy<dx then
        CheckBox4.Checked := true
      else
        CheckBox4.Checked := false;

    nz:=trunc(endz/dz);
    zp:=dz;
           pin:=0;
           ax:=(sx+dtool/2);       ay:=(sy+dtool/2);
           pin:= setXY(ax,ay,zp,1,pin);

           for i := 0 to nz-1 do    // Iterate
           begin
            zp:=1;
                  if i= nz-1 then
                     stepx:=stepxb
                  else
                     stepx:=dtool/2;

            if CheckBox8.Checked=true then
                pin:= setXY(ax,ay,zp,1,pin);

            zp:=(0-(i*(endz/nz)+endz/nz));
                pin:= setXY(ax,ay,zp,2,pin);

            if CheckBox4.Checked = true then
              nxy := trunc((dy-dtool)/stepx)
            else
              nxy := trunc((dx-dtool)/stepx);
              if nxy=0 then nxy:=1;
                

                if CheckBox4.Checked = true then
                  stepx :=(dy-dtool)/nxy
                else
                  stepx :=(dx-dtool)/nxy;

            if CheckBox9.Checked=true then
              begin
              sx:=sx-0.2; sy:=sy-0.2; dx:=dx+0.4; dy:=dy+0.4;
              nxy:=6;
              nm:=trunc(dx/dtool);
              stepx:=dx/nm;
              if nm=0 then nm:=1;
                
               for m := 0 to nm-1 do    // Iterate
               for j := 0 to nxy do    // Iterate
                  begin
                    ax:=sx+(dx-dtool/2-stepx*m)*sin((pi/3)*j);
                    ay:=sy+(dx-dtool/2-stepx*m)*cos((pi/3)*j);
                   pin:= setXY(ax,ay,zp,2,pin);
                  end;
              sx:=sx+0.2; sy:=sy+0.2; dx:=dx-0.4; dy:=dy-0.4;
              end
            else
             for j := 0 to nxy do    // Iterate
              begin
                if CheckBox4.Checked = true then
                  begin
                    ay:=sy+stepx*j+dtool/2;
                    if (j and $1)=0 then
                       ax:=sx+dtool/2
                    else
                       ax:=sx+dx-dtool/2;    // Point1
                   by:=sy+stepx*j+dtool/2;
                    if (j and $1)=1 then
                       bx:=sx+dtool/2
                    else
                       bx:=sx+dx-dtool/2;    // Point1
                  end
                else
                begin
                  ax:=sx+stepx*j+dtool/2;
                  if (j and $1)=0 then
                    ay:=sy+dtool/2
                  else
                    ay:=sy+dy-dtool/2;    // Point1
                  bx:=sx+stepx*j+dtool/2;
                  if (j and $1)=1 then
                    by:=sy+dtool/2
                  else
                    by:=sy+dy-dtool/2;    // Point1
                end;
               if CheckBox6.Checked = true then
                 begin
                   pin:= setXY(ax,ay,zp,2,pin);
                   pin:= setXY(bx,by,zp,2,pin);
                 end;
              if CheckBox9.Checked=false then
              if j=nxy then
               begin
                Memo1.Lines.Add('(End Rectangel)');
                sx:=sx-0.2; sy:=sy-0.2; dx:=dx+0.4; dy:=dy+0.4;
               if CheckBox3.Checked = true then
                if CheckBox7.Checked = true then
                  begin
                  ax:=sx+dx-dtool/2;        ay:=sy+dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                  ax:=sx+dtool/2;           ay:=sy+dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                  ax:=sx+dtool/2;           ay:=sy+dy-dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                  ax:=sx+dx-dtool/2;        ay:=sy+dy-dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                  ax:=sx+dx-dtool/2;        ay:=sy+dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                  sx:=sx+0.2; sy:=sy+0.2; dx:=dx-0.4; dy:=dy-0.4;
                  end
                else
                if CheckBox9.Checked=false then
                begin
                ax:=sx+dx-dtool/2;        ay:=sy+dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                ax:=sx+dx-dtool/2;        ay:=sy+dy-dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                ax:=sx+dtool/2;           ay:=sy+dy-dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                ax:=sx+dtool/2;           ay:=sy+dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                ax:=sx+dx-dtool/2;        ay:=sy+dtool/2;    // Point1
                   pin:= setXY(ax,ay,zp,2,pin);
                sx:=sx+0.2; sy:=sy+0.2; dx:=dx-0.4; dy:=dy-0.4;
                end;
               end;
              end;    // for
           end;
          if CheckBox9.Checked=false then
          if CheckBox5.Checked=true then
            begin // Засверливание углов
              sx:=sx-0.2; sy:=sy-0.2; dx:=dx+0.4; dy:=dy+0.4;
              zpb:=2;
              zp:=0-endz;
                Memo1.Lines.Add('(Fix coner by drilling)');
                ax:=sx+dx;        ay:=sy;    // Point1
                   pin:= setXY(ax,ay,zpb,1,pin);
                   pin:= setXY(ax,ay,zp,2,pin);
                ax:=sx+dx;        ay:=sy+dy;    // Point1
                   pin:= setXY(ax,ay,zp,1,pin);
                   pin:= setXY(ax,ay,zp,2,pin);
                ax:=sx;        ay:=sy+dy;    // Point1
                   pin:= setXY(ax,ay,zp,1,pin);
                   pin:= setXY(ax,ay,zp,2,pin);
                ax:=sx;        ay:=sy;    // Point1
                   pin:= setXY(ax,ay,zp,1,pin);
                   pin:= setXY(ax,ay,zp,2,pin);
                sx:=sx+0.2; sy:=sy+0.2; dx:=dx-0.4; dy:=dy-0.4;
            end;          //Контур

           Memo1.Lines.Add('G00 Z20');
           Memo1.Lines.Add('(Stop for chenge tool)');
           Memo1.Lines.Add('M06');
           Memo1.Lines.Add('(Namber Lins with move ='+IntToStr(pin)+')');


  wx:=Image1.Width;
  wy:=Image1.Height;
  with Image1.Canvas do
  begin
     Brush.Color:=clWhite;    Brush.Style:=bsSolid;
     Pen.Color:=clWhite;      Rectangle(0,0,wx,wy);
  end;    // with
minx:=4000000;
miny:=4000000;
maxx:=0;
maxy:=0;
sly:=4;
slyz:=0;
      for i := 0 to SizeXYZf-1 do    // Iterate
       begin
        if XYc[i].x<>0 then ax:=XYc[i].x;
        if XYc[i].y<>0 then ay:=XYc[i].y;
         if minx > ax then minx:=ax;
         if maxx < ax then maxx:=ax;
         if miny > ay then miny:=ay;
         if maxy < ay then maxy:=ay;
       end;

     minx:=minx*0.80;     miny:=miny*0.80;     maxx:=maxx*1.1;     maxy:=maxy*1.1;
     kx:=wx/(maxx-minx);     ky:=wy/(maxy-miny);
     if CheckBox1.Checked = true then
     if kx > ky  then kx:=ky
     else ky:=kx;
     bx:=0; by:=0;
           with Image1.Canvas do
           begin
           for i := 0 to SizeXYZf-1 do    // Iterate
           if XYc[i].z <> 0 then
             begin
             if slyz<>XYc[i].z then
                begin
                    sly:=sly+2;
                    slyz:=XYc[i].z;
                end;
               
             if i=0 then
                  begin bx:=XYc[i].x; by:=XYc[i].y;
                  end;
              ax:=bx; ay:=by;
              bx:=XYc[i].x;
              by:=XYc[i].y;
                if XYc[i+1].z = 0 then
                  begin
                  cx:=XYc[i].x;
                  cy:=XYc[i].y;
                  end
                else
                  begin
                  cx:=XYc[i+1].x;
                  cy:=XYc[i+1].y;
                  end;
                if Form1.CheckBox2.Checked = true then
                  begin
                  sleep(StrToInt(Edit10.Text));
                  Image1.Refresh;
                  end;
              pa:=trunc(dtool)*2;     if pa<3 then pa:=3;
              if (XYc[i].z-1) = 0 then
                      Image1.Canvas.Pen.Color := clBlue;
              if (XYc[i].z-1) = 1 then
                      Image1.Canvas.Pen.Color := clRed;

              Form1.Image1.Canvas.Pen.Width:=1;

              Ellipse(trunc((ax-minx)*kx+5)-pa+sly,wy-trunc((ay-miny)*ky+5)-pa-sly,trunc((ax-minx)*kx+5)+pa+sly,wy-trunc((ay-miny)*ky+5)+pa-sly);
              MoveTo(trunc((ax-minx)*kx+5)+sly,wy-trunc((ay-miny)*ky+5)-sly);
              LineTo(trunc((bx-minx)*kx+5)+sly,wy-trunc((by-miny)*ky+5)-sly);
              Form1.Image1.Canvas.Pen.Width:=4;
// Visual Z state
              MoveTo(5,wy-trunc(50));
              LineTo(5,wy-trunc(50++XYc[i].z));

              MoveTo(trunc((bx-minx)*kx+5)+sly,wy-trunc((by-miny)*ky+5)+sly);
             end;
           end;
  CheckBox2.Checked:=false;
end;

procedure TForm1.Image1Click(Sender: TObject);
begin
  Form1.CheckBox2.Checked := false;
end;

procedure TForm1.FormResize(Sender: TObject);
begin
Memo1.Height:=Form1.Height-300;
CheckBox2.Checked:=false;
Button1Click(nil);
end;

procedure TForm1.Button2Click(Sender: TObject);
begin
Close;
end;

procedure TForm1.CheckBox9Click(Sender: TObject);
begin
  if CheckBox9.Checked=true then
    Label6.Caption:='Радиус '
  else
    Label6.Caption:='Длина по X';
  if CheckBox9.Checked=true then
    Label7.Caption:='Кол-во Хорд '
  else
    Label7.Caption:='Длина по Y';
end;

end.
