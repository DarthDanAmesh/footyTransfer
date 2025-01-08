from flask import Flask, jsonify, request, send_from_directory
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///players.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Define the Player model
class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    contract_duration = db.Column(db.Integer, nullable=False)
    years_left = db.Column(db.Integer, nullable=False)
    on_loan = db.Column(db.Boolean, nullable=False)
    loan_team = db.Column(db.String(255))
    statistics = db.Column(db.JSON, nullable=False)
    contract_start_date = db.Column(db.Date, nullable=False)
    sell_on_clause = db.Column(db.Boolean, nullable=False, default=False)
    sell_on_percentage = db.Column(db.Float, nullable=True)
    signing_date = db.Column(db.Date, nullable=True)
    nationality = db.Column(db.String(255), nullable=True)
    nationality_flag = db.Column(db.String(255), nullable=True)  # URL for flag image

    # Relationships
    team = db.relationship('Team', backref=db.backref('players', lazy=True))
    transfers = db.relationship('Transfer', backref=db.backref('transfer_player', lazy=True))  # Rename backref


class Transfer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    from_team = db.Column(db.String(255), nullable=False)
    to_team = db.Column(db.String(255), nullable=False)
    transfer_date = db.Column(db.Date, nullable=False)
    transfer_window = db.Column(db.String(50), nullable=False)  # 'summer' or 'winter'
    fee = db.Column(db.Float, nullable=True)  # Transfer fee

    # Rename backref to avoid conflict
    player = db.relationship('Player', backref=db.backref('player_transfers', lazy=True))


class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    team_logo = db.Column(db.String(255), nullable=True)  # New field for team logo


# Create the database and tables
def create_tables():
    with app.app_context():
        db.create_all()

# CRUD Routes

# Create a new player
@app.route('/players', methods=['POST'])
def add_player():
    data = request.get_json()

    # Get team object
    team = Team.query.filter_by(name=data['team']).first()
    if not team:
        team = Team(name=data['team'])
        db.session.add(team)
        db.session.commit()

    new_player = Player(
        name=data['name'],
        position=data['position'],
        price=data['price'],
        team_id=team.id,  # Use team_id instead of team
        contract_duration=data['contract_duration'],
        years_left=data['years_left'],
        on_loan=data['on_loan'],
        loan_team=data.get('loan_team'),
        statistics=data['statistics'],
        contract_start_date=datetime.strptime(data['contract_start_date'], '%Y-%m-%d'),
        sell_on_clause=data.get('sell_on_clause', False),
        sell_on_percentage=data.get('sell_on_percentage'),
        signing_date=datetime.strptime(data['signing_date'], '%Y-%m-%d') if data.get('signing_date') else None,
        nationality=data.get('nationality'),
        nationality_flag=data.get('nationality_flag')
    )
    db.session.add(new_player)
    db.session.commit()
    return jsonify({'message': 'Player added successfully', 'id': new_player.id}), 201


#app to serve static files
@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)


#handle file uploads
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/images/players'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload_player_image/<int:player_id>', methods=['POST'])
def upload_player_image(player_id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Update the player's image URL in the database
        player = Player.query.get_or_404(player_id)
        player.player_image = f'/static/images/players/{filename}'
        db.session.commit()

        return jsonify({'message': 'Image uploaded successfully', 'image_url': player.player_image}), 200

    return jsonify({'error': 'Invalid file type'}), 400



# Read all players
@app.route('/players', methods=['GET'])
def get_players():
    players = Player.query.all()
    return jsonify([{
        'id': player.id,
        'name': player.name,
        'position': player.position,
        'price': player.price,
        'team': player.team.name,  # Access team name through relationship
        'contract_duration': player.contract_duration,
        'years_left': player.years_left,
        'on_loan': player.on_loan,
        'loan_team': player.loan_team,
        'statistics': player.statistics,
        'contract_start_date': player.contract_start_date.strftime('%Y-%m-%d'),
        'nationality': player.nationality,
        'nationality_flag': player.nationality_flag
    } for player in players])



# Read a single player by ID
@app.route('/players/<int:player_id>', methods=['GET'])
def get_player(player_id):
    player = Player.query.get_or_404(player_id)
    return jsonify({
        'id': player.id,
        'name': player.name,
        'position': player.position,
        'price': player.price,
        'team': player.team,
        'contract_duration': player.contract_duration,
        'years_left': player.years_left,
        'on_loan': player.on_loan,
        'loan_team': player.loan_team,
        'statistics': player.statistics,
        'contract_start_date': player.contract_start_date.strftime('%Y-%m-%d')
    })

# Update a player by ID
@app.route('/players/<int:player_id>', methods=['PUT'])
def update_player(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.get_json()

    # Get team if team name is provided
    if 'team' in data:
        team = Team.query.filter_by(name=data['team']).first()
        if team:
            player.team_id = team.id

    for field in ['name', 'position', 'price', 'contract_duration',
                 'years_left', 'on_loan', 'loan_team', 'statistics',
                 'sell_on_clause', 'sell_on_percentage', 'nationality',
                 'nationality_flag']:
        if field in data:
            setattr(player, field, data[field])

    if 'contract_start_date' in data:
        player.contract_start_date = datetime.strptime(data['contract_start_date'], '%Y-%m-%d')
    if 'signing_date' in data:
        player.signing_date = datetime.strptime(data['signing_date'], '%Y-%m-%d') if data['signing_date'] else None

    db.session.commit()
    return jsonify({'message': 'Player updated successfully'})


# Delete a player by ID
@app.route('/players/<int:player_id>', methods=['DELETE'])
def delete_player(player_id):
    player = Player.query.get_or_404(player_id)
    db.session.delete(player)
    db.session.commit()
    return jsonify({'message': 'Player deleted successfully'})


@app.route('/transfers', methods=['POST'])
def add_transfer():
    data = request.get_json()

    # Auto-add "from_team" if it doesn't exist
    from_team = Team.query.filter_by(name=data['from_team']).first()
    if not from_team:
        from_team = Team(name=data['from_team'])
        db.session.add(from_team)
        db.session.commit()

    # Auto-add "to_team" if it doesn't exist
    to_team = Team.query.filter_by(name=data['to_team']).first()
    if not to_team:
        to_team = Team(name=data['to_team'])
        db.session.add(to_team)
        db.session.commit()

    # Add the transfer
    new_transfer = Transfer(
        player_id=data['player_id'],
        from_team=data['from_team'],
        to_team=data['to_team'],
        transfer_date=datetime.strptime(data['transfer_date'], '%Y-%m-%d'),
        transfer_window=data['transfer_window'],
        fee=data.get('fee')
    )
    db.session.add(new_transfer)
    db.session.commit()
    return jsonify({'message': 'Transfer added successfully', 'id': new_transfer.id}), 201


@app.route('/transfers', methods=['GET'])
def get_transfers():
    transfers = Transfer.query.all()
    return jsonify([{
        'id': transfer.id,
        'player_id': transfer.player_id,
        'from_team': transfer.from_team,
        'to_team': transfer.to_team,
        'transfer_date': transfer.transfer_date.strftime('%Y-%m-%d'),
        'transfer_window': transfer.transfer_window,
        'fee': transfer.fee
    } for transfer in transfers])



# Create a new team
@app.route('/teams', methods=['POST'])
def add_team():
    data = request.get_json()
    new_team = Team(
        name=data['name'],
        team_logo=data.get('team_logo')  # Optional field
    )
    db.session.add(new_team)
    db.session.commit()
    return jsonify({'message': 'Team added successfully', 'id': new_team.id}), 201

# Read all teams
@app.route('/teams', methods=['GET'])
def get_teams():
    teams = Team.query.all()
    return jsonify([{
        'id': team.id,
        'name': team.name,
        'team_logo': team.team_logo
    } for team in teams])

# Read a single team by ID
@app.route('/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = Team.query.get_or_404(team_id)
    return jsonify({
        'id': team.id,
        'name': team.name,
        'team_logo': team.team_logo
    })

# Update a team by ID
@app.route('/teams/<int:team_id>', methods=['PUT'])
def update_team(team_id):
    team = Team.query.get_or_404(team_id)
    data = request.get_json()

    team.name = data.get('name', team.name)
    team.team_logo = data.get('team_logo', team.team_logo)

    db.session.commit()
    return jsonify({'message': 'Team updated successfully'})

# Delete a team by ID
@app.route('/teams/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    team = Team.query.get_or_404(team_id)
    db.session.delete(team)
    db.session.commit()
    return jsonify({'message': 'Team deleted successfully'})


#search
@app.route('/players/search', methods=['GET'])
def search_players():
    query = request.args.get('query', '').lower()
    players = Player.query.filter(Player.name.ilike(f'%{query}%')).all()
    return jsonify([{
        'id': player.id,
        'name': player.name,
        'team': player.team
    } for player in players])


@app.route('/teams/search', methods=['GET'])
def search_teams():
    query = request.args.get('query', '').lower()
    teams = Team.query.filter(Team.name.ilike(f'%{query}%')).all()
    return jsonify([{
        'id': team.id,
        'name': team.name,
        'team_logo': team.team_logo
    } for team in teams])



if __name__ == '__main__':
    create_tables()
    app.run(debug=True)