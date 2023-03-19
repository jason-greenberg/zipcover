from .db import db, environment, SCHEMA, add_prefix_for_prod

class CoverLetter(db.Model):
    __tablename__ = 'coverletters'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id'), ondelete='CASCADE'), nullable=False)
    letter_text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=True)
    engine = db.Column(db.String, nullable=False)
    job_description = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'letter_text': self.letter_text,
            'rating': self.rating,
            'engine': self.engine,
            'job_description': self.job_description
        }
