object Form1: TForm1
  Left = 196
  Top = 146
  Width = 656
  Height = 480
  Caption = 'G_code milled-out rectangle'
  Color = clBtnFace
  Constraints.MaxHeight = 1280
  Constraints.MaxWidth = 1600
  Constraints.MinHeight = 480
  Constraints.MinWidth = 640
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'MS Sans Serif'
  Font.Style = []
  OldCreateOrder = False
  OnResize = FormResize
  PixelsPerInch = 96
  TextHeight = 13
  object Label1: TLabel
    Left = 4
    Top = 2
    Width = 83
    Height = 13
    Caption = #1044#1080#1072#1084#1077#1090#1088' '#1092#1088#1077#1079#1099
  end
  object Label2: TLabel
    Left = 4
    Top = 22
    Width = 88
    Height = 13
    Caption = #1043#1083#1091#1073#1080#1085#1072' '#1074#1099#1073#1086#1088#1082#1080
  end
  object Label3: TLabel
    Left = 4
    Top = 62
    Width = 110
    Height = 13
    Caption = #1056#1072#1079#1086#1074#1086#1077' '#1079#1072#1075#1083#1091#1073#1083#1077#1085#1080#1077
  end
  object Label4: TLabel
    Left = 4
    Top = 102
    Width = 39
    Height = 13
    Caption = #1057#1090#1072#1088#1090' X'
  end
  object Label5: TLabel
    Left = 4
    Top = 122
    Width = 39
    Height = 13
    Caption = #1057#1090#1072#1088#1090' Y'
  end
  object Label6: TLabel
    Left = 100
    Top = 102
    Width = 58
    Height = 13
    Caption = #1044#1083#1080#1085#1072' '#1087#1086' X'
  end
  object Label7: TLabel
    Left = 100
    Top = 122
    Width = 58
    Height = 13
    Caption = #1044#1083#1080#1085#1072' '#1087#1086' Y'
  end
  object Label8: TLabel
    Left = 4
    Top = 82
    Width = 113
    Height = 13
    Caption = #1057#1082#1086#1088#1086#1089#1090#1100' '#1092#1088#1077#1079#1077#1088#1086#1074#1082#1080
  end
  object Label9: TLabel
    Left = 4
    Top = 42
    Width = 67
    Height = 13
    Caption = #1064#1072#1075' '#1074#1099#1073#1086#1088#1082#1080
  end
  object Image1: TImage
    Left = 248
    Top = 6
    Width = 397
    Height = 347
    OnClick = Image1Click
  end
  object Label10: TLabel
    Left = 50
    Top = 248
    Width = 130
    Height = 13
    Caption = #1057#1082#1086#1088#1086#1089#1090#1100' '#1072#1085#1080#1084#1072#1094#1080#1080' '#1084#1089#1077#1082
  end
  object Edit1: TEdit
    Left = 120
    Top = 2
    Width = 40
    Height = 21
    TabOrder = 0
    Text = '3,2'
  end
  object Memo1: TMemo
    Left = 4
    Top = 266
    Width = 241
    Height = 87
    ScrollBars = ssVertical
    TabOrder = 16
  end
  object Edit2: TEdit
    Left = 120
    Top = 22
    Width = 40
    Height = 21
    TabOrder = 1
    Text = '1'
  end
  object Edit3: TEdit
    Left = 120
    Top = 62
    Width = 40
    Height = 21
    TabOrder = 3
    Text = '1'
  end
  object Edit4: TEdit
    Left = 50
    Top = 102
    Width = 40
    Height = 21
    TabOrder = 5
    Text = '0'
  end
  object Edit5: TEdit
    Left = 50
    Top = 122
    Width = 40
    Height = 21
    TabOrder = 6
    Text = '0'
  end
  object Edit6: TEdit
    Left = 170
    Top = 102
    Width = 40
    Height = 21
    TabOrder = 7
    Text = '8'
  end
  object Edit7: TEdit
    Left = 170
    Top = 122
    Width = 40
    Height = 21
    TabOrder = 8
    Text = '8'
  end
  object Button1: TButton
    Left = 4
    Top = 206
    Width = 83
    Height = 19
    Caption = #1055#1088#1077#1076#1087#1088#1086#1089#1084#1086#1090#1088' '
    TabOrder = 17
    OnClick = Button1Click
  end
  object Edit8: TEdit
    Left = 120
    Top = 82
    Width = 40
    Height = 21
    TabOrder = 4
    Text = '400'
  end
  object Edit9: TEdit
    Left = 120
    Top = 42
    Width = 40
    Height = 21
    TabOrder = 2
    Text = '1.5'
  end
  object CheckBox1: TCheckBox
    Left = 106
    Top = 228
    Width = 121
    Height = 14
    Caption = #1055#1088#1086#1087#1086#1088#1094#1080#1086#1085#1072#1083#1100#1085#1086
    Checked = True
    State = cbChecked
    TabOrder = 18
  end
  object CheckBox2: TCheckBox
    Left = 4
    Top = 228
    Width = 101
    Height = 14
    Caption = #1040#1085#1080#1084#1072#1094#1080#1103
    TabOrder = 19
  end
  object Edit10: TEdit
    Left = 4
    Top = 242
    Width = 37
    Height = 21
    TabOrder = 20
    Text = '30'
  end
  object CheckBox3: TCheckBox
    Left = 4
    Top = 174
    Width = 62
    Height = 14
    Caption = #1050#1086#1085#1090#1091#1088
    Checked = True
    State = cbChecked
    TabOrder = 13
  end
  object CheckBox4: TCheckBox
    Left = 110
    Top = 142
    Width = 132
    Height = 14
    Caption = #1085#1072#1087#1088#1072#1074#1083#1077#1085#1080#1077' X '#1080#1083#1080' Y'
    TabOrder = 10
  end
  object CheckBox5: TCheckBox
    Left = 4
    Top = 158
    Width = 126
    Height = 14
    Caption = #1047#1072#1089#1074#1077#1088#1083#1080#1074#1072#1090#1100' '#1091#1075#1083#1099
    TabOrder = 11
  end
  object CheckBox6: TCheckBox
    Left = 128
    Top = 158
    Width = 121
    Height = 14
    Caption = #1042#1082#1083#1102#1095#1080#1090#1100' '#1042#1099#1073#1086#1088#1082#1091
    Checked = True
    State = cbChecked
    TabOrder = 12
  end
  object CheckBox7: TCheckBox
    Left = 66
    Top = 172
    Width = 162
    Height = 14
    Caption = #1050#1086#1085#1090#1091#1088' '#1087#1086' '#1095#1072#1089#1086#1074#1086#1081' '#1089#1090#1088#1077#1083#1082#1077
    Checked = True
    State = cbChecked
    TabOrder = 14
  end
  object CheckBox8: TCheckBox
    Left = 4
    Top = 188
    Width = 243
    Height = 15
    Caption = #1042#1099#1074#1086#1076#1080#1090#1100' '#1080#1085#1089#1090#1088#1091#1084#1077#1085#1090' '#1087#1088#1077#1088#1076' '#1079#1072#1075#1083#1091#1073#1083#1077#1085#1080#1077#1084
    TabOrder = 15
  end
  object Button2: TButton
    Left = 170
    Top = 4
    Width = 69
    Height = 21
    Caption = #1042#1099#1093#1086#1076
    TabOrder = 21
    OnClick = Button2Click
  end
  object CheckBox10: TCheckBox
    Left = 4
    Top = 142
    Width = 95
    Height = 13
    Caption = #1040#1074#1090#1086' X '#1080#1083#1080' Y'
    TabOrder = 9
  end
  object CheckBox9: TCheckBox
    Left = 104
    Top = 206
    Width = 101
    Height = 19
    Caption = #1064#1077#1089#1090#1080#1075#1088#1072#1085#1085#1080#1082
    TabOrder = 22
    OnClick = CheckBox9Click
  end
end
