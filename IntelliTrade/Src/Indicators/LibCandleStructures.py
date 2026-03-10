"""
Domain = [marubozu',' spinningtop', 'invertedhammer', 'hammer', 'doji', halfbodydown, halfbodyup, midbody]

Definition:
marubozu       : complate solid/very little wicks both upward and downward
spinningtop    : small body in middle
midbody        : body in contained in middle, with small wicks on both sides. (body greater than spinning top)
doji           : no body in middle
hammer         : long lower wick and a small body in top with no/very little wick
invertedhammer : long upper wick and a small body in bottom with no/very little wick
halfbodyup     : around half body up and half lower wick
halfbodydown   : around half body down and half upper wick

Each of the above 8 candlesticks can be green/red.

Mathematical Classification:

candleOpenCloseHeight = abs(candleOpen - candleClose)
candleHighLowHeight = abs(candleHigh - candleLow)


1. doji           : Body is less than 5% of price range (candleHighLowHeight)
                    Further classification can be done latter beased on the placement of body [doji, dragonfly, gravestone, long-legged, 4-price]
2. spinningtop    : Body is greater then 5% and less than25% and body around middle.



pd.set_option('display.float_format', lambda x: '%.2f' % x)

"""





def classifyCandle(candleOpen, candleHigh, candleLow, candleClose, candleDate=None, verbose=0):
    """
    candleDate is for debuggin purpose
    """
    print(candleDate) if verbose >= 1 else None
    # 
    upperWick = abs(candleHigh - max(candleOpen, candleClose))
    lowerWick = abs(candleLow - min(candleOpen, candleClose))
    # 
    candleOpenCloseRange = abs(candleOpen - candleClose)
    candleHighLowRange = abs(candleHigh - candleLow)
    # 
    # print('upperWick', upperWick, 'lowerWick', lowerWick)
    #
    if candleHighLowRange != 0:
        candleBodyFraction = round(candleOpenCloseRange/candleHighLowRange, 2)
    else:
        candleBodyFraction = 0.0
    # 
    print('candleBodyFraction', candleBodyFraction) if verbose >=1 else None
    #   
    if candleBodyFraction  >= 0 and candleBodyFraction <= 0.05:
        print('Catrgoty1') if verbose >=1 else None
        # return 5
        return '00-05-XX'
    elif candleBodyFraction > 0.05 and candleBodyFraction <= 0.25:
        # 
        if max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.10):
            print('Catrgoty2-Up') if verbose >=1 else None
            # return 5251
            return '05-25-UU'
        elif max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.30):
            print('Catrgoty2-UpMid') if verbose >=1 else None
            # return 5252
            return '05-25-MU'
        elif max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.50):
            print('Catrgoty2-LowMid') if verbose >=1 else None
            # 
            return '05-25-MM'
        elif max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.70):
            print('Catrgoty2-LowMid') if verbose >=1 else None
            # return 5254
            return '05-25-ML'
        else:
            print('Catrgoty2-Low') if verbose >=1 else None
            # return 5255
            return '05-25-LL'
        # 
    elif candleBodyFraction > 0.25 and candleBodyFraction <= 0.40:
        # 
        if max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.20):
            print('Catrgoty3-Up') if verbose >=1 else None
            # return 25401
            return '25-40-UU'
        elif max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.40):
            print('Catrgoty3-MidUp') if verbose >=1 else None
            # return 25402
            return '25-40-MU'
        elif max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.60):
            print('Catrgoty3-MidLow') if verbose >=1 else None
            # return 25404
            return '25-40-ML'
        else:
            print('Catrgoty3-Low') if verbose >=1 else None
            # return 25405
            return '25-40-LL'
        # 
    elif candleBodyFraction > 0.40 and candleBodyFraction <= 0.60:
        # 
        if max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.20):
            print('Catrgoty4-Up') if verbose >=1 else None
            # return 40601
            return '40-60-UU'
        elif max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.40):
            print('Catrgoty4-MidUp') if verbose >=1 else None
            # return 40603
            return '40-60-MM'
        else:
            print('Catrgoty4-Low') if verbose >=1 else None
            # return 40605
            return '40-60-LL'
        # 
    elif candleBodyFraction > 0.60 and candleBodyFraction <= 0.75:
        # 
        if max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.10):
            print('Catrgoty5-Up') if verbose >=1 else None
            # return 60751
            return '60-75-UU'
        elif max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.20):
            print('Catrgoty5-Mid') if verbose >=1 else None
            # return 60753
            return '60-75-MM'
        else:
            print('Catrgoty5-Low') if verbose >=1 else None
            # return 60755
            return '60-75-LL'
        # 
    elif candleBodyFraction > 0.75 and candleBodyFraction <= 0.90:
        # 
        if max(candleOpen, candleClose) > (candleHigh - candleHighLowRange*0.13):
            print('Catrgoty6-Up') if verbose >=1 else None
            # return 75951
            return '75-90-UU'
        else:
            print('Catrgoty6-Low') if verbose >=1 else None
            # return 75955
            return '75-90-LL'
    elif candleBodyFraction > 0.90:
        print('Catrgoty7') if verbose >=1 else None
        # return 95
        return '90-00-XX'
    else:
        print('Unidentified Candle') if verbose >=1 else None
        return 0


# ----------------------------------------------------------------------------------------------------------------------

# def candleHLRange()
# data['classifyCandle'] = data.apply(lambda x: classifyCandle(x.open, x.high, x.low, x.close), axis=1)

# data['OCRange'].mean() # 0.535 (0.1 % of price)
# data['HLRange'].mean() # 1.012 (0.2 % of price)


# Testng
# candleOpen, candleHigh, candleLow, candleClose = (50, 100, 0, 56)
# classifyCandle(candleOpen, candleHigh, candleLow, candleClose, verbose=1)

# candleOpen, candleHigh, candleLow, candleClose = (50, 100, 0, 56)

# candleOpen, candleHigh, candleLow, candleClose = (50, 100, 0, 56)
# classifyCandle(candleOpen, candleHigh, candleLow, candleClose, verbose=1)



# ----------------------------------------------------------------------------------------------------------------------

if __name__ == '__main__':
    import pandas as pd
    import os
    # Example data path
    data_path = os.getenv('EXAMPLE_DATA_PATH', 'AXISBANK_MINUTE_2020-11-25.csv')
    
    if os.path.exists(data_path):
        data = pd.read_csv(data_path)
        data['time'] = data.date.apply(lambda x: ':'.join(x.split()[1].split(':')[:2])) 
        data['classifyCandle'] = data.apply(lambda x: classifyCandle(x.open, x.high, x.low, x.close), axis=1)
        print(data.classifyCandle.value_counts().sort_index(ascending=False))
    else:
        print(f"Example data file not found: {data_path}")

# ----------------------------------------------------------------------------------------------------------------------
