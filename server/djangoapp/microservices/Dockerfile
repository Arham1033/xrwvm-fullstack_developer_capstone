FROM python:3.9.18-slim-bookworm


WORKDIR /python-docker

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .

# NLTK reads the VADER lexicon straight from this zip
# (sentiment/vader_lexicon.zip/vader_lexicon/vader_lexicon.txt)
ENV NLTK_DATA=/python-docker/nltk_data
RUN mkdir -p "$NLTK_DATA/sentiment" \
    && cp sentiment/vader_lexicon.zip "$NLTK_DATA/sentiment/vader_lexicon.zip"

RUN ls
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
