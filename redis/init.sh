#!/bin/sh

echo -e "user default off\nuser stocktaking on -@all +@connection +@scripting +SET +GET +DEL +INFO +KEYS +INCRBY +PTTL +EXPIRE ~* >$REDIS_PASSWORD" > /usr/local/etc/redis/users.acl