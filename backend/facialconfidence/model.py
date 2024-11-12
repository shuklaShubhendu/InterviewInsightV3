import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def load_data():
    
    data = pd.read_csv('./fer2013.csv')
    images = []
    labels = []

    for index, row in data.iterrows():
       
        pixels = np.fromstring(row['pixels'], sep=' ').reshape(48, 48, 1)
        images.append(pixels)
        labels.append(row['emotion'])

    images = np.array(images)
    labels = np.array(labels)
    images = images.astype('float32') / 255.0

    return images, labels

def build_model(input_shape=(48, 48, 1)):
    model = models.Sequential()
    model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Conv2D(64, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Conv2D(128, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Flatten())
    model.add(layers.Dense(128, activation='relu'))
    model.add(layers.Dense(7, activation='softmax'))  

    return model


def train_model():
    images, labels = load_data()
    X_train, X_test, y_train, y_test = train_test_split(images, labels, test_size=0.2, random_state=42)

    model = build_model()
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

   
    model.fit(X_train, y_train, epochs=30, batch_size=64, validation_data=(X_test, y_test))

 
    model.save('emotion_model.h5')

if __name__ == "__main__":
    train_model()
