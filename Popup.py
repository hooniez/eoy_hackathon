from tkinter import messagebox, Tk, IntVar, Label, Scale
from client import Client

# main window
main = Tk(className = 'window')
client = Client()

background_colour = 'red'
text_colour = background_colour
slider_colour = "red"
slider_background_colour = "orange"

main['background'] = background_colour
sw = int(main.winfo_screenwidth()/3)
sh = 200

x = 0
y = main.winfo_screenheight()-sh-100


main.geometry(f'{sw}x{sh}+{x}+{y}')
main.resizable(False, False)
main.title('Exprencir Real time Feedback')

main.columnconfigure(0, weight=1)
main.columnconfigure(1, weight=3)
main.columnconfigure(2, weight=1)

# slider current value
current_value = IntVar()


def get_current_value():
    return '{: .2f}'.format(current_value.get())


def slider_changed(event):
    sliderVal = get_current_value()
    value_label.configure(text=sliderVal)


def onClose():
    if messagebox.askokcancel("Quit", "Do you want to quit?"):
        client.send(client.DISCONNECTMSG)
        main.destroy()

def tick():
    client.send(get_current_value())
    main.after(1000, tick)


# labels for the slider negative side
neg_label = Label(
    main,
    text='Don\'t get it:',
    font=('Helvetica bold', 22),
    padx=5,
    bg = text_colour
)
neg_label.grid(
    column=0,
    row=0,
    sticky='e' 
)

# labels for the slider positive side
pos_label = Label(
    main,
    text='Get it',
    padx=5,
    font=('Helvetica bold', 22),
    bg = text_colour
)

pos_label.grid(
    column=2,
    row=0,
    sticky='w'
)

#  slider
slider = Scale(
    main,
    from_=0,
    to=100,
    orient='horizontal',
    command=slider_changed,
    variable=current_value,
    width=50,
    bg = slider_colour,
    troughcolor = slider_background_colour
)

slider.grid(
    column=1,
    row=0,
    sticky='we'
)

current_value_label = Label(
    main,
    text='Feedback',
    font=('Helvetica bold', 22),
    bg = text_colour
)

current_value_label.grid(
    row=1,
    columnspan=5,
    sticky='s',
    ipadx=10,
    ipady=10,
)

value_label = Label(
    main,
    font=('Helvetica bold', 22),
    text=get_current_value(),
    bg = text_colour
)

value_label.grid(
    row=2,
    columnspan=5,
    sticky='n'
)


### Makes the main loop work, so the box sits on the screen
tick()
main.protocol("WM_DELETE_WINDOW", onClose)
main.mainloop()
