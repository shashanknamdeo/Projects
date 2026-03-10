"""
https://docs.python.org/3/howto/logging.html#configuring-logging

"""
# ----------------------------------------------------------------------------------------------------------------------

import os
from datetime import datetime
import logging

# today_datetime = datetime.now().strftime('%Y%m%d_%H%M%S')
# logger = logging.getLogger('Intellitrade')
# logger.setLevel(logging.DEBUG)

# consoleHandlerLogLevel = logging.DEBUG
# fileHandlerLogLevel = logging.DEBUG 

# # Create console handler and set level to debug
# consoleHandler = logging.StreamHandler()
# consoleHandler.setLevel(consoleHandlerLogLevel)
# consoleHandler.set_name('ConsoleHandler')
# formatter = logging.Formatter('%(asctime)s:%(module)s:%(funcName)s:%(levelname)s: %(message)s', datefmt='%H:%M:%S')
# consoleHandler.setFormatter(formatter)
# logger.addHandler(consoleHandler)


# fileHandler = logging.FileHandler(filename=os.path.join(GOOGLEDRIVE_TRADE_LOGS_DIR, str(today_datetime)+'.log'))
# fileHandler.setLevel(fileHandlerLogLevel)
# fileHandler.set_name('FileHandler')
# formatter = logging.Formatter('%(asctime)s:%(module)s:%(funcName)s:%(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
# fileHandler.setFormatter(formatter)
# logger.addHandler(fileHandler)


def setConsoleHandlerLogLevel(level):
    """
    """
    for handler in logger.handlers:
        if type(handler) == logging.StreamHandler:
            handler.setLevel(level)


def setFileHandlerLogLevel(level):
    for handler in logger.handlers:
        if type(handler) == logging.FileHandler:
            handler.setLevel(level)

# ----------------------------------------------------------------------------------------------------------------------

def initializeLogger(directory_path=GOOGLEDRIVE_TRADE_LOGS_DIR, file_name=datetime.now().strftime('%Y%m%d_%H%M%S')+'.log'):
    """
    """
    # Configuring+Initializing Logger
    # 
    logger = logging.getLogger('Intellitrade')
    logger.setLevel(logging.DEBUG)
    # 
    consoleHandlerLogLevel = logging.DEBUG
    fileHandlerLogLevel = logging.DEBUG
    # 
    consoleHandler = logging.StreamHandler()
    consoleHandler.setLevel(consoleHandlerLogLevel)
    consoleHandler.set_name('ConsoleHandler')
    formatter = logging.Formatter('%(asctime)s:%(module)s:%(funcName)s:%(levelname)s:%(lineno)04d: %(message)s', datefmt='%H:%M:%S')
    consoleHandler.setFormatter(formatter)
    logger.addHandler(consoleHandler)
    # 
    os.makedirs(directory_path, exist_ok=True)
    fileHandler = logging.FileHandler(filename=os.path.join(directory_path, file_name))
    fileHandler.setLevel(fileHandlerLogLevel)
    fileHandler.set_name('FileHandler')
    formatter = logging.Formatter('%(asctime)s:%(module)s:%(funcName)s:%(levelname)s:%(lineno)04d: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    fileHandler.setFormatter(formatter)
    # 
    logger.addHandler(fileHandler)
    return logger

# ----------------------------------------------------------------------------------------------------------------------

class dummyLogger:
    def debug(self, message):
        print(message)
    
    def ingo(self, message):
        print(message)
    
    def error(self, message):
        print(message)
    
    def exception(self, message):
        print(message)
    
    def warning(self, message):
        print(message)

# ----------------------------------------------------------------------------------------------------------------------

# def closeLoggerFileHandler():
#     global fileHandler
#     try:
#         fileHandler.close()
#         del fileHandler
#     except NameError as ne:
#         print(ne)
#         pass

# def initiateLoggerFileHandler(fileHandlerLogLevel=logging.DEBUG, filename_extention=None):
#     """
#     Initiating FileHandler in this function so as to re-initiate them when needed.
#     """
#     global logger
#     global fileHandler
#     # 
#     # Close existing fileHandler before a initiating a new one
#     closeLoggerFileHandler()
#     # 
#     # Creating file handler and adding it to the same logger
#     today_datetime = datetime.now().strftime('%Y%m%d_%H%M%S')
#     if filename_extention is not None:
#         filehandler_filename = os.path.join(Intellitrade_LOGS_DIR, str(today_datetime)+'_'+filename_extention+'.log')
#     else:
#         filehandler_filename = os.path.join(Intellitrade_LOGS_DIR, str(today_datetime)+'.log')
#     # 
#     fileHandler = logging.FileHandler(filename=filehandler_filename)
#     fileHandler.setLevel(fileHandlerLogLevel)
#     formatter = logging.Formatter('%(asctime)s:%(module)s:%(funcName)s:%(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
#     fileHandler.setFormatter(formatter)
#     logger.addHandler(fileHandler)


# initiateLoggerFileHandler()

# ----------------------------------------------------------------------------------------------------------------------

# '%(asctime)s:%(name)s:%(module)s:%(funcName)s:%(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S'