from flask import Blueprint, jsonify, make_response, request
from flask_login import login_required, current_user
from app.models import Application, db

application_routes = Blueprint('applications', __name__)

def page_not_found():
    response = make_response(jsonify({"error": "Sorry, the application you're looking for does not exist."}), 404)
    return response

# Get all applications of current user
@application_routes.route('/')
@login_required
def get_applications():
    """
    Query for all applications and returns them in a list of application dictionaries
    """
    applications = Application.query.filter_by(user_id=current_user.id).all()

    return [a.to_dict() for a in applications]

# Get application by id
@application_routes.route('/<int:id>')
@login_required
def get_application_by_id(id):
    """
    Query for a single application by id
    """
    application = Application.query.get(id)
    
    # Return 404 if application not found
    if application is None:
        return page_not_found()
    
    # Return 403 if application does not belong to user
    if application.user_id != current_user.id:
        return make_response(jsonify({'error': 'Application must belong to the current user'}), 403)
    
    return application.to_dict()

# Delete application by id
@application_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_application(id):
    """
    Deletes an application by id
    """
    application = Application.query.get(id)

    # Return 404 if application not found
    if application is None:
        return page_not_found()
    
    # Return 403 if application does not belong to user
    if application.user_id != current_user.id:
        return make_response(jsonify({'error': 'Application must belong to the current user'}), 403)
    
    # Delete application
    db.session.delete(application)
    db.session.commit()

    return { 'message': 'Successfully deleted application' }
