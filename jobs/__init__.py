from flask.cli import AppGroup
from jobs.collectMovie import collect_run

# グループを作成
job = AppGroup('job')

# task関連のコマンドを追加していく
job.add_command(collect_run)