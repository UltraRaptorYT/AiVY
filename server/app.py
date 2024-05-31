from flask import Flask, request, send_file
from stegano import lsb
from PIL import Image
import io
from flask_cors import CORS
import numpy as np
import tensorflow as tf

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route("/decode/stegano", methods=['POST'])
def decode_stegano():
    if 'image' not in request.files:
        return 'No image uploaded', 400
    image_file = request.files['image']

    # Check if the file is actually an image
    if image_file.filename == '':
        return 'No image selected', 400

    if image_file:
        image = Image.open(image_file)
        secret_message = lsb.reveal(image)
        return secret_message


@app.route("/encode/stegano", methods=['POST'])
def encode_stegano():
    if 'image' not in request.files:
        return 'No image uploaded', 400
    image_file = request.files['image']

    # Check if the file is actually an image
    if image_file.filename == '':
        return 'No image selected', 400

    if image_file:
        # Read the image file
        image = Image.open(image_file)

        # Apply LSB steganography
        secret_message = request.form.get('message', 'FUNNY WORDS Protected by AiVY')
        encoded_image = lsb.hide(image, secret_message)

        encoded_image_io = io.BytesIO()

        # Save the image to the in-memory file
        encoded_image_format = image.format  # Use the original image format
        encoded_image.save(encoded_image_io, format=encoded_image_format)
        encoded_image_io.seek(0)

        # Return the contents of the in-memory file
        return send_file(encoded_image_io, mimetype=f'image/{encoded_image_format.lower()}')


@app.route("/poison", methods=['POST'])
def poison():
    if 'image' not in request.files:
        return 'No image uploaded', 400
    image_file = request.files['image']

    # Check if the file is actually an image
    if image_file.filename == '':
        return 'No image selected', 400

    if image_file:
        # Read the image file
        image = Image.open(image_file)
        encoded_image_format = image.format  # Use the original image format
        image = image.convert('RGB')
        image_np = np.array(image, dtype=np.float32) / 255.0
        image_tf = tf.convert_to_tensor(image_np, dtype=tf.float32)
        epsilon = 0.01

        perturbations = tf.random.uniform(image_tf.shape, minval=-epsilon, maxval=epsilon, dtype=tf.float32)

        adversarial_image_tf = tf.clip_by_value(image_tf + perturbations, 0.0, 1.0)
        adversarial_image_np = adversarial_image_tf.numpy()
        adversarial_image = (adversarial_image_np * 255).astype(np.uint8)
        adversarial_image_pil = Image.fromarray(adversarial_image)

        # Create an in-memory file to store the encoded image
        encoded_image_io = io.BytesIO()

        # Save the image to the in-memory file
        adversarial_image_pil.save(encoded_image_io, format=encoded_image_format)
        encoded_image_io.seek(0)

        # Return the contents of the in-memory file
        return send_file(encoded_image_io, mimetype=f'image/{encoded_image_format.lower()}')


if __name__ == '__main__':
    app.run(debug=True)
