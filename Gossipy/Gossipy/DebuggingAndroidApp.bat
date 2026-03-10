::This is comment


@ECHO OFF
::This above annotation is required, otherwise everything is printerd with the prompt and path on terminal.

::Creeating Alias
::https://stackoverflow.com/questions/20530996/aliases-in-windows-command-prompt
rem https://superuser.com/questions/560519/how-to-set-an-alias-in-windows-command-line
rem DOSKEY command can be used to define macros which can be used as ALIAS
rem doskey macroName=macroDefinition

DOSKEY ls=dir


ECHO Locations
ECHO 1. Strat Server
ECHO 2. Start Server and Reset Cache
ECHO 3. Start / Restart app on android (autometically start server)


SET /P choice=Choose Location:

IF %choice% == 1 GOTO :OPTION1
IF %choice% == 2 GOTO :OPTION2
IF %choice% == 3 GOTO :OPTION3
GOTO :END


:OPTION1
    npx react-native start
    GOTO :END
:OPTION2
    npx react-native start --reset-cache
    GOTO :END
:OPTION3
    npx react-native run-android
    GOTO :END
:END

