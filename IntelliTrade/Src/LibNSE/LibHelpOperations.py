
from datetime import datetime
from dateutil.relativedelta import relativedelta, TH

import sys
import os
from pathlib import Path

# Add project root to sys.path if needed for imports
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

try:
    from config.paths import PYTHON_LIB_FILEIO_DIR
except ImportError:
    # Fallback to local lib folder if config is not available
    PYTHON_LIB_FILEIO_DIR = 'lib_fileio'

sys.path.append(PYTHON_LIB_FILEIO_DIR)

from LibFetchFileNameFromDisk import toFetchAllFilesinDirectory

# -------------------------------------------------------------------------------------------------

def toFindHighLowMean(data_path):
    import pandas as pd
    # High-Low mean
    instrumentDF = pd.read_csv(data_path)
    #
    instrumentDF['high-low_percent'] = (abs(instrumentDF['high']-instrumentDF['low'])/instrumentDF['low'])*100
    return instrumentDF['high-low_percent'].mean()

def toSaveMeanOfAllDFInDict(path):
    #  r"D:\NotebookShareAsus\Material\Python\Projects\NSE\Data\Daily_data"
    import os 
    file_name_list = os.listdir(path)
    file_path_list = toFetchAllFilesinDirectory(path)
    mean_dict={}
    for i in range(0,len(file_name_list)):
        mean=toFindHighLowMean(file_path_list[i])
        name_temp=file_name_list[i]
        length=len(name_temp)
        name=name_temp[slice(len(name_temp)-4)]
        mean_dict[name]=mean
    return mean_dict

# -------------------------------------------------------------------------------------------------

def toFindHighLowMean(data_path):
    import pandas as pd
    # High-Low mean
    instrumentDF = pd.read_csv(data_path)
    #
    instrumentDF['high-low_percent'] = (abs(instrumentDF['high']-instrumentDF['low'])/instrumentDF['low'])*100
    return instrumentDF['high-low_percent'].mean()

def toSaveMeanOfAllDFInDict(path):
    #  r"D:\NotebookShareAsus\Material\Python\Projects\NSE\Data\Daily_data"
    import os 
    file_name_list = os.listdir(path)
    file_path_list = toFetchAllFilesinDirectory(path)
    mean_dict={}
    for i in range(0,len(file_name_list)):
        mean=toFindHighLowMean(file_path_list[i])
        name_temp=file_name_list[i]
        length=len(name_temp)
        name=name_temp[slice(len(name_temp)-4)]
        mean_dict[name]=mean
    return mean_dict

# -------------------------------------------------------------------------------------------------

def toAppendDataframe(path_list):
    # path_list= ['D:\\NotebookShare\\Material\\Python\\Projects\\NSE\\Data\\NIFTY50\\20140101_20141231.csv','D:\\NotebookShare\\Material\\Python\\Projects\\NSE\\Data\\NIFTY50\\20150101_20151231.csv']
    # FutureWarning: The frame.append method is deprecated and will be removed from pandas in a future version. Use pandas.concat instead
    import pandas as pd
    df1 = pd.DataFrame()
    for element in path_list:
        df2=pd.read_csv(element)
        df_new=pd.concat([df1,df2],ignore_index=True)
        df1=df_new
    return df1

def loadHistoricalDataFromDisk(instrument_name, path):
    """
    instrument_name='NIFTY50'
    instrumentDF = loadHistoricalDataFromDisk(instrument_name=instrument_name, path=path)
    """
    # path=r'D:\NotebookShareAsus\Material\Python\Projects\NSE\Data'
    import os
    full_path=os.path.join(path,instrument_name)
    files_path=toFetchAllFilesinDirectory(full_path)
    data_frame=toAppendDataframe(files_path)
    return data_frame

instrumentDF = loadHistoricalDataFromDisk(instrument_name=instrument_name, path=path)
instrumentDF['close-open'] = instrumentDF['Close']-instrumentDF['Open']
instrumentDF['close-open_percent'] = (abs(instrumentDF['Close']-instrumentDF['Open'])/instrumentDF['Open'])*100
instrumentDF['close-open_percent'].describe()


instrumentDF['high-low'] = instrumentDF['High']-instrumentDF['Low']
instrumentDF['high-low_percent'] = (abs(instrumentDF['High']-instrumentDF['Low'])/instrumentDF['Low'])*100
instrumentDF['high-low_percent'].describe()

# -------------------------------------------------------------------------------------------------

# Methord 1

def toAppendDataframe(path_list):
    # path_list= ['D:\\NotebookShare\\Material\\Python\\Projects\\NSE\\Data\\NIFTY50\\20140101_20141231.csv','D:\\NotebookShare\\Material\\Python\\Projects\\NSE\\Data\\NIFTY50\\20150101_20151231.csv']
    # FutureWarning: The frame.append method is deprecated and will be removed from pandas in a future version. Use pandas.concat instead
    import pandas as pd
    df1 = pd.DataFrame()
    for element in path_list:
        df2=pd.read_csv(element)
        df_new=pd.concat([df1,df2],ignore_index=True)
        df1=df_new
    return df1

# Methord 2
# path_list= ['D:\\NotebookShare\\Material\\Python\\Projects\\NSE\\Data\\NIFTY50\\20140101_20141231.csv','D:\\NotebookShare\\Material\\Python\\Projects\\NSE\\Data\\NIFTY50\\20150101_20151231.csv']
df = pd.concat(
    map(pd.read_csv, [path_list]), ignore_index=True)
print(df)

# -------------------------------------------------------------------------------------------------

def toDescribeDataWithHighLow(data_path):
    instrumentDF = pd.read_csv(data_path)
    #
    instrumentDF['high-low_percent'] = (abs(instrumentDF['High']-instrumentDF['Low'])/instrumentDF['Low'])*100
    return instrumentDF['high-low_percent'].describe()

# -------------------------------------------------------------------------------------------------

def toFetchAllFilesinDirectory(path):
    # path = r"D:\NotebookShare\Material\Python\Projects\NSE\Data\NIFTY50"
    import os
    dir_list = os.listdir(path)
    files_name = []
    for element in dir_list:
        if os.path.isfile(os.path.join(path,element)) :
            files_name.append(os.path.join(path,element))
    return files_name

# -------------------------------------------------------------------------------------------------

def toFetchAllFilesinDirectory(path):
    # path = r"\NotebookShare\Material\Python\Projects\NSE\Data\NIFTY50"
    import os
    dir_list = os.listdir(path)
    files_name = []
    for element in dir_list:
        if os.path.isfile(os.path.join(path,element)) == True :
            files_name.append(os.path.join(path,element))
    return files_name

# def fetchAllFilesInDirRecursively(path):
#     # path = r"\NotebookShare\Material\Python\Projects\NSE\Data\NIFTY50"
#     import os
#     dir_list = os.listdir(path)
#     files_name = []
#     for element in dir_list:

# -------------------------------------------------------------------------------------------------

def toFetchAllFilesinDirectory(path):
    # path = r"D:\NotebookShare\Material\Python\Projects\NSE\Data\NIFTY50"
    import os
    dir_list = os.listdir(path)
    files_name = []
    for element in dir_list:
        if os.path.isfile(os.path.join(path,element)) :
            files_name.append(os.path.join(path,element))
    return files_name

# -------------------------------------------------------------------------------------------------


def getLastThrusdayOfTheMonth():
    """
    """
    today_date = datetime.today()
    current_month = today_date.month
    # 
    for i in range(1, 6):
        t = today_date + relativedelta(weekday=TH(i))
        if t.month != current_month:
            # since t is exceeded we need last one which we can get by subtracting -2 since it is already a Thursday.
            t = t + relativedelta(weekday=TH(-2))
            break
    return t.strftime('%d-%b-%Y')

# -------------------------------------------------------------------------------------------------

# If I run code on 29th, I need 29th as Thursday, but If I run the code after 29, I need 6th October as next Thursday
# 23 se lekar 29 tak, haar din 29 hi chahiye

def toGetUpcomingThrusday():
    """
    """
    today_day=datetime.today()
    upcoming_thrusday=today_day+relativedelta(weekday=TH)
    return upcoming_thrusday.strftime('%d-%b-%Y')

