# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-22 17:26
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_auto_20160322_0630'),
    ]

    operations = [
        migrations.RenameField(
            model_name='vaccinegroup',
            old_name='short_name',
            new_name='name',
        ),
        migrations.RemoveField(
            model_name='vaccinegroup',
            name='long_name',
        ),
    ]