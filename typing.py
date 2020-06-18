import sys
import pynput
import time

print("start typing...")
kb = pynput.keyboard.Controller()
kb.press(pynput.keyboard.Key.alt)
kb.press(pynput.keyboard.Key.tab)
kb.release(pynput.keyboard.Key.alt)
kb.release(pynput.keyboard.Key.tab)
time.sleep(.300)

print(sys.argv[1])
pynput.keyboard.Controller().type(sys.argv[1])
