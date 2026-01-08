import jwt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from fastapi import Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security
from jwt import ExpiredSignatureError, DecodeError
from fastapi import HTTPException

bearer = HTTPBearer()

load_dotenv()

secret_key = os.getenv("secret_key")

def create_token(details: dict, expiry:int):
    expiry = datetime.now() + timedelta(minutes=expiry)

    details.update({"exp": expiry})

    encoded_jwt = jwt.encode(details, secret_key, algorithm="HS256")

    return encoded_jwt

# def verify_token(request: HTTPAuthorizationCredentials = Security(bearer)):
#     token = request.credentials
#     #payload = request.headers.get("Authorization")

#     #token = payload.split(" ")[1]

#     verified_token = jwt.decode(token, secret_key, algorithms=["HS256"])
#     print(f"Incoming Token: {token}")


#     #expiry_time = verify_token.get("exp")

    

#     return{
#         "email": verified_token.get("email"),
#         "userType": verified_token.get("userType"),
#         "userid": verified_token.get("userid")           
#     }




def verify_token(request: HTTPAuthorizationCredentials = Security(bearer)):
    token = request.credentials
    print(f"Incoming Token: {token}")

    try:
        verified_token = jwt.decode(token, secret_key, algorithms=["HS256"])
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except DecodeError:
        raise HTTPException(status_code=401, detail="Invalid or corrupted token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

    return {
        "email": verified_token.get("email"),
        "userType": verified_token.get("userType"),
        "user_id": verified_token.get("user_id")
    }
