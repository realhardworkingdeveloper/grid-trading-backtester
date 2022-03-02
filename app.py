from flask import *  
  
app = Flask(__name__) #creating the Flask class object   
 
@app.route('/') #decorator drfines the   
def home():  
    return render_template('home.html');  
  
if __name__ =='__main__':  
    app.run(debug = True)  