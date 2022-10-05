FROM python:3

# set a directory for the app
WORKDIR /crawler

# copy all the files to the container
COPY . .

# install dependencies
RUN pip install --upgrade pip \
    pip install --no-cache-dir -r requirements.txt

# tell the port number the container should expose
EXPOSE 8000

# run the command
CMD ["python", "-u", "./main.py"]