from flask import Blueprint
from server.controllers.article_controller import (
    get_articles, create_article, get_article, update_article, delete_article
)

article_bp = Blueprint('article', __name__, url_prefix='/api/articles')

# Article routes
article_bp.route('', methods=['GET'])(get_articles)
article_bp.route('', methods=['POST'])(create_article)
article_bp.route('/<uuid:article_id>', methods=['GET'])(get_article)
article_bp.route('/<uuid:article_id>', methods=['PUT'])(update_article)
article_bp.route('/<uuid:article_id>', methods=['DELETE'])(delete_article)