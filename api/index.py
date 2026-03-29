from __future__ import annotations

from flask import Flask


def create_app() -> Flask:
    app = Flask(__name__)

    from api.routes.consolidate import bp as consolidate_bp
    from api.routes.guided import bp as guided_bp
    from api.routes.npc_chat import bp as npc_chat_bp
    from api.routes.simulate_turn import bp as simulate_turn_bp

    app.register_blueprint(simulate_turn_bp)
    app.register_blueprint(npc_chat_bp)
    app.register_blueprint(guided_bp)
    app.register_blueprint(consolidate_bp)

    @app.route("/api/python")
    def hello_world():
        return "<p>Hello, World!</p>"

    return app


app = create_app()
