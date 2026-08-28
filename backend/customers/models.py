import uuid
from django.db import models
from django.contrib.auth.models import User

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    users = models.ManyToManyField(User, related_name='organizations')

    def __str__(self):
        return self.name
